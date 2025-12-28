const Report = require('../models/Report');
const { categorizeReport, analyzeSentiment, analyzePriority } = require('./aiService');

const createReport = async (reportData, user, files) => {
    // Process attachments
    const attachments = files ? files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
    })) : [];

    // Parse coordinates if sent as a string
    let coordinates = reportData.location.coordinates;
    if (typeof coordinates === 'string') {
        try {
            coordinates = JSON.parse(coordinates);
        } catch (e) {
            coordinates = undefined;
        }
    }

    const newReportData = {
        reporterId: user.userId,
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        location: {
            type: 'Point',
            coordinates: coordinates || reportData.location.coordinates,
            address: reportData.location.address || '',
            building: reportData.location.building || '',
            floor: reportData.location.floor || ''
        },
        incidentTime: reportData.incidentTime || new Date(),
        attachments,
        isAnonymous: user.isAnonymous || true,
    };

    const report = await Report.create(newReportData);

    // AI processing (async - don't block response)
    try {
        const aiCategory = await categorizeReport(report.description);
        const sentiment = await analyzeSentiment(report.description);
        const aiPriority = analyzePriority(aiCategory, sentiment, report.description); // Use aiCategory here

        report.aiCategory = aiCategory;
        report.sentiment = sentiment;
        report.priority = aiPriority; // Update the priority field with AI-generated priority
        await report.save();
    } catch (aiError) {
        console.error('AI processing error:', aiError);
        // Continue without AI processing
    }

    return report;
};

module.exports = {
    createReport,
};
