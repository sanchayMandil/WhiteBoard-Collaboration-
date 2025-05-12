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

async function deleteBoard(req, res) {
  console.log('Delete board request received');
  console.log('req.params:', req.params);

  try {
    const boardId = req.params.boardId; // Access boardId directly
    console.log('boardId:', boardId);

    // Validate boardId format
    if (!boardId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid boardId format:', boardId);
      return res.status(400).json({ message: 'Invalid boardId format' });
    }

    const deletedBoard = await Whiteboard.findByIdAndDelete(boardId);
    console.log('Deletion attempt completed:', deletedBoard);

    if (!deletedBoard) {
      console.log('Whiteboard not found for ID:', boardId);
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    console.log('Whiteboard deleted successfully:', deletedBoard);
    res.status(200).json({ message: 'Whiteboard deleted successfully', boardId });
  } catch (error) {
    console.error('Error deleting whiteboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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


async function createBoard(req, res) {
   try {
     const whiteboard = new Whiteboard({
       title: 'Untitled',
       layers: [
         { id: 'layer-0', name: 'Host Layer', lines: [], isVisible: true },
         { id: 'layer-1', name: 'Guest Layer', lines: [], isVisible: true },
       ],
       creatorEmail: req.user.email,
     });
     await whiteboard.save();
     res.json({ whiteboardId: whiteboard._id, message: 'Whiteboard created' });
   } catch (err) {
     console.error('Error creating whiteboard:', err);
     res.status(500).json({ message: 'Server error' });
   }
}

module.exports = { saveContent, fetchBoard, createBoard, deleteBoard, loadContent, updateContent };