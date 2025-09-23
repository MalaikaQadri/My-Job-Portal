const { FAQS } = require("../models");

const createFAQ = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const faq = await FAQS.create({ title, description });

    return res.status(201).json({
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (err) {
    console.error("Error creating FAQ:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required for update",
      });
    }

    const faq = await FAQS.findByPk(id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    await faq.update({ title, description });

    return res.status(200).json({
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (err) {
    console.error("Error updating FAQ:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQS.findByPk(id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    await faq.destroy();

    return res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQS.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "FAQs fetched successfully",
      data: faqs,
    });
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createFAQ, updateFAQ, deleteFAQ, getAllFAQs };