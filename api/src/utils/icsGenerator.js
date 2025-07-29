const { v4: uuidv4 } = require('uuid');

// Fonction pour formater une date en format ICS
const formatICSDate = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Fonction pour échapper les caractères spéciaux dans les valeurs ICS
const escapeICSValue = (value) => {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

// Génération du fichier ICS pour un rendez-vous
const generateICSFile = (appointmentData) => {
  const { client, appointment, project } = appointmentData;
  
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  const now = new Date();
  
  // Génération d'un UID unique pour l'événement
  const uid = `${appointmentData._id || uuidv4()}@leonceouattara.com`;
  
  // Construction de la description
  let description = `Rendez-vous avec Leonce Ouattara\\n\\n`;
  description += `Type: ${appointment.type}\\n`;
  if (appointment.description) {
    description += `Description: ${escapeICSValue(appointment.description)}\\n`;
  }
  if (project?.type) {
    description += `Projet: ${project.type}\\n`;
  }
  if (project?.description) {
    description += `Détails projet: ${escapeICSValue(project.description)}\\n`;
  }
  description += `\\nDurée: ${appointment.duration} minutes\\n`;
  description += `\\nContact: leonce.ouattara@outlook.fr\\n`;
  description += `Téléphone: +225 05 45 13 07 39`;

  // Construction de la localisation
  let location = '';
  if (appointment.location) {
    switch (appointment.location.type) {
      case 'online':
        location = appointment.location.meetingLink || 'Visioconférence (lien à venir)';
        break;
      case 'office':
        location = 'Bureau Leonce Ouattara Studio, Abidjan, Côte d\'Ivoire';
        break;
      case 'client-office':
        location = appointment.location.address || 'Bureau client';
        break;
      case 'phone':
        location = 'Appel téléphonique';
        break;
      default:
        location = appointment.location.details || 'À définir';
    }
  }

  // Construction du contenu ICS
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leonce Ouattara Studio//Appointment System//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Paris',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART;TZID=Europe/Paris:${formatICSDate(startDate).slice(0, -1)}`,
    `DTEND;TZID=Europe/Paris:${formatICSDate(endDate).slice(0, -1)}`,
    `SUMMARY:${escapeICSValue(appointment.title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeICSValue(location)}`,
    `ORGANIZER;CN=Leonce Ouattara:mailto:leonce.ouattara@outlook.fr`,
    `ATTENDEE;CN=${escapeICSValue(client.firstName + ' ' + client.lastName)};RSVP=TRUE:mailto:${client.email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'PRIORITY:5',
    'CLASS:PUBLIC',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Rendez-vous dans 15 minutes',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Rendez-vous dans 1 heure',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

// Génération d'un fichier ICS d'annulation
const generateCancellationICS = (appointmentData) => {
  const { client, appointment } = appointmentData;
  
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  const now = new Date();
  
  const uid = `${appointmentData._id || uuidv4()}@leonceouattara.com`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leonce Ouattara Studio//Appointment System//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART;TZID=Europe/Paris:${formatICSDate(startDate).slice(0, -1)}`,
    `DTEND;TZ ID=Europe/Paris:${formatICSDate(endDate).slice(0, -1)}`,
    `SUMMARY:ANNULÉ: ${escapeICSValue(appointment.title)}`,
    `ORGANIZER;CN=Leonce Ouattara:mailto:leonce.ouattara@outlook.fr`,
    `ATTENDEE;CN=${escapeICSValue(client.firstName + ' ' + client.lastName)}:mailto:${client.email}`,
    'STATUS:CANCELLED',
    'SEQUENCE:1',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

module.exports = {
  generateICSFile,
  generateCancellationICS,
  formatICSDate,
  escape ICSValue
};