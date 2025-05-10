const express = require('express');
const Issue = require('../models/issue');

async function saveIssue(req, res) {
    try {
        const { title, description, email } = req.body; // Extract data from the request body
    
        const newIssue = new Issue({
          issueTitle: title, // Map 'title' from the request to 'issueTitle' in the model
          issueDescription: description, // Map 'description' to 'issueDescription'
          createdBy: email, // Map 'email' to 'createdBy'
          // status will default to false as defined in your schema
        });
    
        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
      } catch (error) {
        console.error('Error saving issue:', error);
        res.status(400).json({ error: error.message });
      }
}

module.exports = saveIssue;