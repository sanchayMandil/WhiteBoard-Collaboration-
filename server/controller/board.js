const express = require('express');
const Whiteboard = require('../models/board');

async function saveContent(req, res) {
  try {
    const { title, layers, creatorEmail } = req.body;
    console.log(req.body);
    if (!title || !layers[0].lines) {
      return res.status(400).json({ message: 'Title and lines are required' });
    }
    const whiteboard = new Whiteboard({ title, layers, creatorEmail });
    await whiteboard.save();
    res.status(201).json({ message: 'Whiteboard saved successfully', whiteboardId: whiteboard._id });
  } catch (error) {
    console.error('Error saving whiteboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// for loading the board content
async function loadContent(req, res) {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    res.status(200).json(whiteboard);
  } catch (error) {
    console.error('Error retrieving whiteboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// if exested bord content got updated content
async function updateContent(req, res) {
  try {
    const { title, layers, creatorEmail } = req.body;
    if (!title || !layers[0].lines) {
      return res.status(400).json({ message: 'Title and lines are required' });
    }
    const whiteboard = await Whiteboard.findByIdAndUpdate(
      req.params.id,
      { title, layers, creatorEmail, updatedAt: Date.now() },
      { new: true }
    );
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    res.status(200).json({ message: 'Whiteboard updated successfully', whiteboard });
  } catch (error) {
    console.error('Error updating whiteboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// for dashboard board 
async function fetchBoard(req, res) {
  try {
    const { creatorEmail } = req.query;
    if (!creatorEmail) {
      return res.status(400).json({ error: 'creatorEmail is required' });
    }
    const whiteboards = await Whiteboard.find({ creatorEmail });
    console.log(whiteboards);
    res.status(200).json(whiteboards);
  } catch (error) {
    console.error('Error fetching whiteboards:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { saveContent, fetchBoard, loadContent, updateContent };