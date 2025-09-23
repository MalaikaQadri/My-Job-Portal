const { User, Job, Application, sequelize } = require("../models");
const { Op } = require("sequelize");

const getAnalytics = async (req, res) => {
  try {
    const { from, to, granularity = "day" } = req.query;

    const dateFilter = {};
    if (from && to) {
      dateFilter[Op.between] = [new Date(from), new Date(to)];
    }

    // Run queries in parallel
    const [totalUsers, totalJobs, totalApplications, jobSeries, applicationSeries, userSeries] =
      await Promise.all([
        User.count(),
        Job.count(),
        Application.count(),
        Job.findAll({
          attributes: [
            [sequelize.fn("date_trunc", granularity, sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["date"],
          order: [[sequelize.literal("date"), "ASC"]],
          raw: true
        }),
        Application.findAll({
          attributes: [
            [sequelize.fn("date_trunc", granularity, sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["date"],
          order: [[sequelize.literal("date"), "ASC"]],
          raw: true
        }),
        User.findAll({
          attributes: [
            [sequelize.fn("date_trunc", granularity, sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
          ],
          where: from && to ? { createdAt: dateFilter } : {},
          group: ["date"],
          order: [[sequelize.literal("date"), "ASC"]],
          raw: true
        }),
      ]);

    return res.status(200).json({
      totals: {
        users: totalUsers,
        jobs: totalJobs,
        applications: totalApplications,
      },
      series: {
        jobs: jobSeries,
        applications: applicationSeries,
        users: userSeries,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports= { getAnalytics }