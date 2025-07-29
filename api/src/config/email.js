const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configuration SMTP par défaut (Gmail)
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  // Support pour différents services
  if (process.env.EMAIL_SERVICE) {
    switch (process.env.EMAIL_SERVICE.toLowerCase()) {
      case 'gmail':
        config.service = 'gmail';
        break;
      case 'outlook':
        config.service = 'hotmail';
        break;
      case 'sendgrid':
        config.host = 'smtp.sendgrid.net';
        config.port = 587;
        break;
      case 'mailgun':
        config.host = 'smtp.mailgun.org';
        config.port = 587;
        break;
    }
  }

  return nodemailer.createTransporter(config);
};

// Vérification de la configuration email
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed:', error);
    return false;
  }
};

// Validation d'adresse email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation avancée d'email avec vérification de domaine
const validateEmailAdvanced = async (email) => {
  if (!validateEmail(email)) {
    return { isValid: false, reason: 'Format invalide' };
  }

  // Liste des domaines temporaires/jetables courants
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'temp-mail.org'
  ];

  const domain = email.split('@')[1].toLowerCase();
  
  if (disposableDomains.includes(domain)) {
    return { isValid: false, reason: 'Email temporaire non autorisé' };
  }

  return { isValid: true };
};

module.exports = {
  createTransporter,
  verifyEmailConfig,
  validateEmail,
  validateEmailAdvanced
};