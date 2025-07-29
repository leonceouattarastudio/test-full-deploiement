const { createTransporter, validateEmailAdvanced } = require('../config/email');
const { generateICSFile } = require('../utils/icsGenerator');
const { getEmailTemplate } = require('../templates/emailTemplates');
const logger = require('../config/logger');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = createTransporter();
  }

  // Envoyer un email avec gestion d'erreurs
  async sendEmail(options) {
    try {
      const result = await this.transporter.sendMail(options);
      logger.info(`Email sent successfully to ${options.to}`, {
        messageId: result.messageId,
        subject: options.subject
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error(`Erreur envoi email: ${error.message}`);
    }
  }

  // Email de confirmation de rendez-vous
  async sendAppointmentConfirmation(appointmentData) {
    const { client, appointment, project } = appointmentData;

    // Validation de l'email
    const emailValidation = await validateEmailAdvanced(client.email);
    if (!emailValidation.isValid) {
      throw new Error(`Email invalide: ${emailValidation.reason}`);
    }

    // Génération du fichier ICS
    const icsContent = generateICSFile(appointmentData);
    
    // Génération du template HTML
    const htmlContent = getEmailTemplate('appointmentConfirmation', {
      clientName: `${client.firstName} ${client.lastName}`,
      appointmentTitle: appointment.title,
      appointmentDate: new Date(appointment.startTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: appointment.duration,
      location: appointment.location,
      description: appointment.description,
      projectType: project?.type,
      meetingLink: appointment.location?.meetingLink,
      cancellationLink: `${process.env.FRONTEND_URL}/appointments/cancel/${appointmentData.cancellationToken}`,
      rescheduleLink: `${process.env.FRONTEND_URL}/appointments/reschedule/${appointmentData.rescheduleToken}`
    });

    const emailOptions = {
      from: {
        name: 'Leonce Ouattara Studio',
        address: process.env.EMAIL_FROM || 'noreply@leonceouattara.com'
      },
      to: client.email,
      subject: `Confirmation de rendez-vous - ${appointment.title}`,
      html: htmlContent,
      attachments: [
        {
          filename: 'rendez-vous.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8'
        }
      ]
    };

    return await this.sendEmail(emailOptions);
  }

  // Email de rappel de rendez-vous
  async sendAppointmentReminder(appointmentData) {
    const { client, appointment } = appointmentData;

    const htmlContent = getEmailTemplate('appointmentReminder', {
      clientName: `${client.firstName} ${client.lastName}`,
      appointmentTitle: appointment.title,
      appointmentDate: new Date(appointment.startTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      meetingLink: appointment.location?.meetingLink,
      duration: appointment.duration,
      location: appointment.location
    });

    const emailOptions = {
      from: {
        name: 'Leonce Ouattara Studio',
        address: process.env.EMAIL_FROM || 'noreply@leonceouattara.com'
      },
      to: client.email,
      subject: `Rappel - Rendez-vous demain: ${appointment.title}`,
      html: htmlContent
    };

    return await this.sendEmail(emailOptions);
  }

  // Email d'annulation de rendez-vous
  async sendAppointmentCancellation(appointmentData, reason = null) {
    const { client, appointment } = appointmentData;

    const htmlContent = getEmailTemplate('appointmentCancellation', {
      clientName: `${client.firstName} ${client.lastName}`,
      appointmentTitle: appointment.title,
      appointmentDate: new Date(appointment.startTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      reason: reason,
      rebookLink: `${process.env.FRONTEND_URL}/appointments/book`
    });

    const emailOptions = {
      from: {
        name: 'Leonce Ouattara Studio',
        address: process.env.EMAIL_FROM || 'noreply@leonceouattara.com'
      },
      to: client.email,
      subject: `Annulation de rendez-vous - ${appointment.title}`,
      html: htmlContent
    };

    return await this.sendEmail(emailOptions);
  }

  // Email de reprogrammation de rendez-vous
  async sendAppointmentReschedule(appointmentData, oldDateTime) {
    const { client, appointment } = appointmentData;

    // Génération du nouveau fichier ICS
    const icsContent = generateICSFile(appointmentData);

    const htmlContent = getEmailTemplate('appointmentReschedule', {
      clientName: `${client.firstName} ${client.lastName}`,
      appointmentTitle: appointment.title,
      oldDate: new Date(oldDateTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      oldTime: new Date(oldDateTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      newDate: new Date(appointment.startTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      newTime: new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: appointment.duration,
      location: appointment.location,
      meetingLink: appointment.location?.meetingLink
    });

    const emailOptions = {
      from: {
        name: 'Leonce Ouattara Studio',
        address: process.env.EMAIL_FROM || 'noreply@leonceouattara.com'
      },
      to: client.email,
      subject: `Rendez-vous reporté - ${appointment.title}`,
      html: htmlContent,
      attachments: [
        {
          filename: 'nouveau-rendez-vous.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8'
        }
      ]
    };

    return await this.sendEmail(emailOptions);
  }

  // Email de notification admin
  async sendAdminNotification(appointmentData, type = 'new') {
    const { client, appointment, project } = appointmentData;

    const htmlContent = getEmailTemplate('adminNotification', {
      type,
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      clientPhone: client.phone || 'Non renseigné',
      clientCompany: client.company?.name || 'Non renseignée',
      appointmentTitle: appointment.title,
      appointmentDate: new Date(appointment.startTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: appointment.duration,
      appointmentType: appointment.type,
      projectType: project?.type || 'Non spécifié',
      projectBudget: project?.budget?.range || 'Non spécifié',
      projectTimeline: project?.timeline || 'Non spécifiée',
      projectDescription: project?.description || 'Aucune description',
      adminLink: `${process.env.ADMIN_URL}/appointments/${appointmentData._id}`
    });

    const emailOptions = {
      from: {
        name: 'Leonce Ouattara Studio - Notifications',
        address: process.env.EMAIL_FROM || 'noreply@leonceouattara.com'
      },
      to: process.env.ADMIN_EMAIL || 'admin@leonceouattara.com',
      subject: `${type === 'new' ? 'Nouveau' : 'Modification'} RDV - ${appointment.title}`,
      html: htmlContent
    };

    return await this.sendEmail(emailOptions);
  }

  // Test de configuration email
  async testEmailConfiguration() {
    try {
      const testEmail = {
        from: {
          name: 'Leonce Ouattara Studio',
          address: process.env.EMAIL_FROM || 'noreply@leonceouattara.com'
        },
        to: process.env.ADMIN_EMAIL || 'admin@leonceouattara.com',
        subject: 'Test de configuration email',
        html: `
          <h2>Test de configuration email</h2>
          <p>Si vous recevez cet email, la configuration SMTP fonctionne correctement.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      };

      const result = await this.sendEmail(testEmail);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();