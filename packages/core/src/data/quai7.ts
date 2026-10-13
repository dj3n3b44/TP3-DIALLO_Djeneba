import type {
  CaseData,
  CaseDocument,
  CaseEvent,
  CasePerson,
  CasePlace,
  ContradictionNote,
  Fact,
  FactSubject,
} from '../types';

const rapportDouane = [
  'RAPPORT DE DOUANE — 3 mars 2026',
  'Rédigé par C. Avril, douanière de garde au port de Port-du-Nord.',
  '',
  "Le cargo Nordlys est arrivé sur le quai 7 à 18 h 40. L'accostage s'est achevé à 19 h 05. Le déchargement a commencé à 19 h 30 et s'est terminé à 20 h 10. La caisse scellée du lot coton, portant le scellé XM-433, a été déposée au hangar 12 avant 20 h 30. Le docker en chef J. Mercier a signé le reçu de prise en charge à 20 h 45.",
  '',
  "Le 2 mars à 22 h 15, l'agent comptable P. Vigneau a constaté les scellés brisés.",
].join('\n');

const interviewMercier = [
  'AUDITION DE JACQUES MERCIER — 4 mars 2026',
  'Conduite par la commissaire R. Frank, bureau de la douane de Port-du-Nord.',
  '',
  'Q. À quelle heure êtes-vous arrivé sur le quai 7 ?',
  'R. À 19 heures pile. Quand je suis arrivé, le déchargement était déjà terminé et les caisses étaient déjà au hangar 12.',
  '',
  'Q. Êtes-vous resté sur place toute la soirée ?',
  "R. Oui, je n'ai pas quitté le quai de toute la soirée. Entre 19 heures et 22 heures, j'étais sur le quai 7, je surveillais le chantier.",
].join('\n');

const journalMartin = [
  'JOURNAL DE RONDE — Théo Martin, veilleur de nuit — 2 mars 2026',
  '',
  '21 h 15 : début de ronde, quai calme.',
  "21 h 30 : passage au quai 7. Le café L'Ancre est plein ce soir ; j'ai vu Mercier au café L'Ancre, à une table, à 21 h 30.",
  '22 h 30 : passage au hangar 12, je découvre les scellés brisés sur la caisse et je préviens la douane aussitôt.',
].join('\n');

const manifesteNordlys = [
  'MANIFESTE DU NORDLYS — 27 février 2026',
  'Capitaine : H. Bensaïd.',
  '',
  'Le Nordlys a quitté Anvers le 27 février 2026 à destination de Port-du-Nord. Marchandise déclarée : coton égyptien en balles (14 balles) et une caisse scellée n° XM-443, scellée par le chargeur, déclarée comme matériel agricole.',
  '',
  'Signé : H. Bensaïd, capitaine.',
].join('\n');

const connaissement = [
  'CONNAISSEMENT — lot 14 — 27 février 2026',
  'Consignataire portuaire : P. Vigneau, bureau de la douane de Port-du-Nord.',
  '',
  'Marchandise embarquée à Anvers sur le Nordlys : coton égyptien, 14 balles, et une caisse scellée par le chargeur, contenant deux cent quarante montres-bracelets en argent. Aucune assurance complémentaire signée.',
  '',
  'Pour la consignation, P. Vigneau.',
].join('\n');

const journalBord = [
  'JOURNAL DE BORD — Nordlys — mars 2026',
  'Capitaine H. Bensaïd.',
  '',
  "1er mars 2026 : départ d'Anvers à 9 h 00, chargement complet.",
  '2 mars 2026 : arrivée à Port-du-Nord à 18 h 40, quai 7, accostage 19 h 05.',
  "21 h 00 : pause du capitaine au café L'Ancre.",
].join('\n');

const noteVigneau = [
  'NOTE RAPIDE — 3 mars 2026',
  'P. Vigneau, agent comptable de la consignation.',
  '',
  "L'inventaire du 2 mars au soir, au hangar 12, a confirmé : la caisse parvenue sous le scellé XM-433 contenait des balles de coton et non les montres-bracelets en argent portées au connaissement. Le scellé XM-433 était intact à 20 h 10 et brisé à 22 h 15. J'ai consigné l'anomalie au registre.",
].join('\n');

const documents: CaseDocument[] = [
  {
    id: 'rapport-douane',
    title: 'Rapport de douane du 3 mars',
    kind: 'rapport',
    authorId: 'avril',
    placeId: 'douane',
    date: '2026-03-03',
    tags: ['douane', 'arrivée', 'scellés'],
    content: rapportDouane,
  },
  {
    id: 'interview-mercier',
    title: 'Audition de Jacques Mercier',
    kind: 'audition',
    placeId: 'douane',
    date: '2026-03-04',
    tags: ['audition', 'mercier', 'déchargement'],
    content: interviewMercier,
  },
  {
    id: 'journal-martin',
    title: 'Journal de ronde de Théo Martin',
    kind: 'journal de ronde',
    authorId: 'martin',
    placeId: 'quai7',
    date: '2026-03-02',
    tags: ['ronde', 'surveillance', 'mercier'],
    content: journalMartin,
  },
  {
    id: 'manifeste-nordlys',
    title: 'Manifeste du Nordlys (départ d’Anvers)',
    kind: 'manifeste',
    authorId: 'bensaid',
    placeId: 'anvers',
    date: '2026-02-27',
    tags: ['manifeste', 'nordlys', 'cargaison', 'scellés'],
    content: manifesteNordlys,
  },
  {
    id: 'connaissement',
    title: 'Connaissement du lot 14',
    kind: 'connaissement',
    authorId: 'vigneau',
    placeId: 'douane',
    date: '2026-02-27',
    tags: ['connaissement', 'lot 14', 'cargaison'],
    content: connaissement,
  },
  {
    id: 'journal-nordlys',
    title: 'Journal de bord du Nordlys',
    kind: 'journal de bord',
    authorId: 'bensaid',
    placeId: 'nordlys',
    date: '2026-03-02',
    tags: ['journal de bord', 'nordlys', 'traversée'],
    content: journalBord,
  },
  {
    id: 'note-vigneau',
    title: 'Note d’anomalie de P. Vigneau',
    kind: 'note',
    authorId: 'vigneau',
    placeId: 'douane',
    date: '2026-03-03',
    tags: ['note', 'anomalie', 'scellés', 'inventaire'],
    content: noteVigneau,
  },
];

const people: CasePerson[] = [
  {
    id: 'avril',
    name: 'Claire Avril',
    role: 'douanière',
    description: "Douanière de garde au port de Port-du-Nord, a rédigé le rapport d'arrivée.",
  },
  {
    id: 'mercier',
    name: 'Jacques Mercier',
    role: 'docker en chef',
    description: 'Docker en chef du quai 7, responsable du déchargement du lot 14.',
  },
  {
    id: 'bensaid',
    name: 'Hassan Bensaïd',
    role: 'capitaine',
    description: 'Capitaine du cargo Nordlys.',
  },
  {
    id: 'vigneau',
    name: 'Pierre Vigneau',
    role: 'agent comptable',
    description: 'Agent comptable de la consignation, chargé du lot 14.',
  },
  {
    id: 'martin',
    name: 'Théo Martin',
    role: 'veilleur de nuit',
    description: 'Veilleur de nuit du port, tient le journal de ronde.',
  },
  {
    id: 'lefevre',
    name: 'Marie Lefèvre',
    role: 'gérante de café',
    description: "Gérante du café L'Ancre, en face du quai 7.",
  },
];

const places: CasePlace[] = [
  {
    id: 'quai7',
    name: 'Quai 7',
    kind: 'quai',
    description: 'Quai de commerce où le Nordlys a accosté.',
  },
  {
    id: 'nordlys',
    name: 'Cargo Nordlys',
    kind: 'navire',
    description: 'Cargo de 3 000 tonnes amarré au quai 7.',
  },
  {
    id: 'cafe-lancre',
    name: "Café L'Ancre",
    kind: 'café',
    description: 'Café en face du quai 7, rendez-vous des dockers.',
  },
  {
    id: 'douane',
    name: 'Bureau de la douane',
    kind: 'bâtiment',
    description: 'Bâtiment administratif du port, siège de la consignation.',
  },
  {
    id: 'hangar-12',
    name: 'Hangar 12',
    kind: 'hangar',
    description: 'Hangar de stockage où la caisse scellée a été déposée.',
  },
  {
    id: 'anvers',
    name: "Port d'Anvers",
    kind: 'port',
    description: 'Port de départ du Nordlys.',
  },
];

const events: CaseEvent[] = [
  {
    id: 'depart-anvers',
    title: "Départ d'Anvers",
    date: '2026-02-27',
    time: '09:00',
    kind: 'départ',
    placeId: 'anvers',
    participantIds: ['bensaid'],
    description: 'Le Nordlys quitte le port d’Anvers chargé du lot 14.',
  },
  {
    id: 'arrivee-nordlys',
    title: 'Arrivée du Nordlys au quai 7',
    date: '2026-03-02',
    time: '18:40',
    kind: 'arrivée',
    placeId: 'quai7',
    participantIds: ['bensaid'],
    description: 'Le cargo arrive à Port-du-Nord et se présente au quai 7.',
  },
  {
    id: 'accostage',
    title: 'Accostage et amarrage',
    date: '2026-03-02',
    time: '19:05',
    kind: 'manutention',
    placeId: 'quai7',
    participantIds: ['bensaid', 'mercier', 'avril'],
    description: 'Le Nordlys est amarré, les opérations de quai commencent.',
  },
  {
    id: 'dechargement',
    title: 'Déchargement du lot 14',
    date: '2026-03-02',
    time: '19:30',
    kind: 'manutention',
    placeId: 'quai7',
    participantIds: ['mercier', 'avril'],
    description: 'Le lot 14, dont la caisse scellée, est débarqué sur le quai 7.',
  },
  {
    id: 'depot-caisse',
    title: 'Dépôt de la caisse scellée',
    date: '2026-03-02',
    time: '20:10',
    kind: 'stockage',
    placeId: 'hangar-12',
    participantIds: ['mercier'],
    description: 'La caisse scellée est transférée au hangar 12.',
  },
  {
    id: 'releve-recu',
    title: 'Signature du reçu de prise en charge',
    date: '2026-03-02',
    time: '20:45',
    kind: 'contrôle',
    placeId: 'douane',
    participantIds: ['mercier', 'avril'],
    description: 'Jacques Mercier signe le reçu, Claire Avril contresigne.',
  },
  {
    id: 'pause-lancre',
    title: "Pause du capitaine au café L'Ancre",
    date: '2026-03-02',
    time: '21:00',
    kind: 'pause',
    placeId: 'cafe-lancre',
    participantIds: ['bensaid'],
    description: 'Le capitaine Bensaïd fait une pause au café en face du quai.',
  },
  {
    id: 'ronde-2130',
    title: 'Ronde de 21 h 30',
    date: '2026-03-02',
    time: '21:30',
    kind: 'ronde',
    placeId: 'quai7',
    participantIds: ['martin'],
    description: 'Théo Martin effectue sa ronde et note ce qu’il observe au quai 7.',
  },
  {
    id: 'inventaire-scelles',
    title: 'Inventaire, scellés brisés',
    date: '2026-03-02',
    time: '22:15',
    kind: 'contrôle',
    placeId: 'hangar-12',
    participantIds: ['vigneau', 'avril'],
    description: 'La caisse est inventoriée : le scellé est brisé, le contenu est anormal.',
  },
  {
    id: 'alerte-douane',
    title: 'Alerte à la douane',
    date: '2026-03-02',
    time: '22:30',
    kind: 'alerte',
    placeId: 'douane',
    participantIds: ['martin', 'avril'],
    description: 'Théo Martin prévient la douane après le constat au hangar 12.',
  },
];

const documentById = new Map(documents.map((document) => [document.id, document]));

function handler(documentId: string): CaseDocument {
  const document = documentById.get(documentId);
  if (!document) {
    throw new Error(`Document de référence introuvable : ${documentId}`);
  }
  return document;
}

function span(
  document: CaseDocument,
  anchor: string,
): { excerptStart: number; excerptEnd: number } {
  const start = document.content.indexOf(anchor);
  if (start === -1) {
    throw new Error(`Ancre introuvable dans « ${document.id} » : ${anchor}`);
  }
  return { excerptStart: start, excerptEnd: start + anchor.length };
}

function fact(
  id: string,
  documentId: string,
  subject: FactSubject,
  attribute: string,
  value: string,
  anchor: string,
): Fact {
  const document = handler(documentId);
  return {
    id,
    documentId,
    subject,
    attribute,
    value,
    ...span(document, anchor),
  };
}

const person = (id: string): FactSubject => ({ type: 'person', id });
const place = (id: string): FactSubject => ({ type: 'place', id });
const event = (id: string): FactSubject => ({ type: 'event', id });
const object = (id: string, label: string): FactSubject => ({ type: 'object', id, label });

const facts: Fact[] = [
  fact(
    'f-rapport-arrivee',
    'rapport-douane',
    event('arrivee-nordlys'),
    'heureArrivee',
    '18 h 40',
    'à 18 h 40',
  ),
  fact(
    'f-rapport-accostage',
    'rapport-douane',
    event('accostage'),
    'heureFin',
    '19 h 05',
    'à 19 h 05',
  ),
  fact(
    'f-rapport-dechargement',
    'rapport-douane',
    event('dechargement'),
    'heureDebut',
    '19 h 30',
    'à 19 h 30',
  ),
  fact(
    'f-rapport-depot',
    'rapport-douane',
    event('depot-caisse'),
    'heure',
    'avant 20 h 30',
    'avant 20 h 30',
  ),
  fact(
    'f-rapport-recu',
    'rapport-douane',
    event('releve-recu'),
    'heureSignature',
    '20 h 45',
    'à 20 h 45',
  ),
  fact(
    'f-rapport-scelle',
    'rapport-douane',
    object('caisse-q7', 'la caisse scellée du quai 7'),
    'scelle',
    'XM-433',
    'XM-433',
  ),
  fact(
    'f-rapport-inventaire-constat',
    'rapport-douane',
    event('inventaire-scelles'),
    'constat',
    'oui',
    'a constaté les scellés brisés',
  ),
  fact(
    'f-rapport-inventaire-heure',
    'rapport-douane',
    event('inventaire-scelles'),
    'heure',
    '22 h 15',
    'à 22 h 15',
  ),
  fact(
    'f-rapport-hangar',
    'rapport-douane',
    place('hangar-12'),
    'stockage',
    'caisse scellée',
    'a été déposée au hangar 12',
  ),
  fact(
    'f-rapport-avril',
    'rapport-douane',
    person('avril'),
    'poste',
    'douanière de garde',
    'douanière de garde',
  ),

  fact(
    'f-mercier-dechargement',
    'interview-mercier',
    event('dechargement'),
    'heureDebut',
    'avant 19 h 00',
    'le déchargement était déjà terminé',
  ),
  fact(
    'f-mercier-position',
    'interview-mercier',
    person('mercier'),
    'position',
    'quai 7',
    "je n'ai pas quitté le quai de toute la soirée",
  ),
  fact(
    'f-mercier-heure',
    'interview-mercier',
    person('mercier'),
    'heurePoste',
    '19 h 00',
    'À 19 heures pile',
  ),
  fact(
    'f-mercier-activite',
    'interview-mercier',
    person('mercier'),
    'activite',
    'surveillance du chantier',
    'je surveillais le chantier',
  ),

  fact(
    'f-martin-position-mercier',
    'journal-martin',
    person('mercier'),
    'position',
    "café L'Ancre",
    "j'ai vu Mercier au café L'Ancre",
  ),
  fact(
    'f-martin-ronde',
    'journal-martin',
    event('ronde-2130'),
    'heure',
    '21 h 30',
    '21 h 30 : passage au quai 7',
  ),
  fact(
    'f-martin-alerte',
    'journal-martin',
    event('alerte-douane'),
    'heure',
    '22 h 30',
    '22 h 30 : passage au hangar 12',
  ),
  fact(
    'f-martin-inventaire',
    'journal-martin',
    event('inventaire-scelles'),
    'constat',
    'oui',
    'je découvre les scellés brisés',
  ),
  fact(
    'f-martin-tache',
    'journal-martin',
    person('martin'),
    'tache',
    'veilleur de nuit',
    'veilleur de nuit',
  ),
  fact(
    'f-martin-position',
    'journal-martin',
    person('martin'),
    'position',
    'quai 7',
    'passage au quai 7',
  ),
  fact(
    'f-martin-cafe-affluence',
    'journal-martin',
    place('cafe-lancre'),
    'affluence',
    'plein',
    "Le café L'Ancre est plein",
  ),

  fact(
    'f-manifeste-depart',
    'manifeste-nordlys',
    event('depart-anvers'),
    'date',
    '2026-02-27',
    'quitté Anvers le 27 février 2026',
  ),
  fact(
    'f-manifeste-scelle',
    'manifeste-nordlys',
    object('caisse-q7', 'la caisse scellée du quai 7'),
    'scelle',
    'XM-443',
    'caisse scellée n° XM-443',
  ),
  fact(
    'f-manifeste-capitaine',
    'manifeste-nordlys',
    person('bensaid'),
    'role',
    'capitaine',
    'H. Bensaïd, capitaine',
  ),

  fact(
    'f-connaissement-vigneau',
    'connaissement',
    person('vigneau'),
    'role',
    'consignataire portuaire',
    'Consignataire portuaire : P. Vigneau',
  ),
  fact(
    'f-connaissement-contenu',
    'connaissement',
    object('caisse-q7', 'la caisse scellée du quai 7'),
    'contenuDeclare',
    'montres-bracelets en argent',
    'montres-bracelets en argent',
  ),

  fact(
    'f-bord-depart',
    'journal-nordlys',
    event('depart-anvers'),
    'date',
    '2026-03-01',
    "1er mars 2026 : départ d'Anvers",
  ),
  fact(
    'f-bord-arrivee',
    'journal-nordlys',
    event('arrivee-nordlys'),
    'heureArrivee',
    '18 h 40',
    'arrivée à Port-du-Nord à 18 h 40',
  ),
  fact(
    'f-bord-accostage',
    'journal-nordlys',
    event('accostage'),
    'heureFin',
    '19 h 05',
    'accostage 19 h 05',
  ),
  fact(
    'f-bord-pause',
    'journal-nordlys',
    event('pause-lancre'),
    'heure',
    '21 h 00',
    '21 h 00 : pause du capitaine',
  ),
  fact(
    'f-bord-capitaine',
    'journal-nordlys',
    person('bensaid'),
    'role',
    'capitaine',
    'Capitaine H. Bensaïd',
  ),

  fact(
    'f-note-titre',
    'note-vigneau',
    person('vigneau'),
    'titre',
    'agent comptable',
    'agent comptable de la consignation',
  ),
  fact(
    'f-note-contenu',
    'note-vigneau',
    object('caisse-q7', 'la caisse scellée du quai 7'),
    'constatContenu',
    'balles de coton',
    'contenait des balles de coton',
  ),
  fact(
    'f-note-inventaire',
    'note-vigneau',
    event('inventaire-scelles'),
    'heure',
    '22 h 15',
    'brisé à 22 h 15',
  ),
];

const contradictionNotes: Record<string, ContradictionNote> = {
  'event:dechargement:heureDebut': {
    severity: 'majeure',
    subject: 'le déchargement du lot 14',
    title: "L'heure du déchargement ne tient pas",
    explanation:
      'Le rapport de douane fixe le début du déchargement à 19 h 30, alors que Jacques Mercier affirme le déchargement « déjà terminé » à son arrivée, à 19 heures pile. Deux horaires incompatibles pour un même évènement.',
  },
  'person:mercier:position': {
    severity: 'critique',
    subject: 'Jacques Mercier',
    title: "L'alibi de Mercier vacille",
    explanation:
      "Mercier assure qu'il n'a pas quitté le quai de toute la soirée, mais le journal de ronde de Théo Martin le place au café L'Ancre à 21 h 30, autour d'une table. Il ne peut pas être aux deux endroits.",
  },
  'object:caisse-q7:scelle': {
    severity: 'critique',
    subject: 'la caisse scellée du quai 7',
    title: 'Un numéro de scellé qui change',
    explanation:
      'Le manifeste déclare la caisse scellée sous le numéro XM-443 ; la douane a réceptionné la même caisse sous le scellé XM-433. Le scellé a été substitué entre le chargement et le déchargement.',
  },
  'event:depart-anvers:date': {
    severity: 'majeure',
    subject: "le départ du Nordlys d'Anvers",
    title: 'Une date de départ contradictoire',
    explanation:
      'Le manifeste indique que le Nordlys a quitté Anvers le 27 février 2026 ; le journal de bord du navire fixe le départ au 1er mars 2026. Un même voyage ne peut pas partir à deux dates.',
  },
};

export const quai7: CaseData = {
  id: 'quai7',
  name: "L'affaire du quai 7",
  synopsis:
    'Nuit du 2 au 3 mars 2026, au port de Port-du-Nord. Le cargo Nordlys décharge une caisse scellée au quai 7. Au matin, les scellés sont brisés et le contenu ne correspond pas au chargement. Quatre incohérences documentaires restent à exposer.',
  documents,
  people,
  places,
  events,
  facts,
  contradictionNotes,
};

export function getQuai7Case(): CaseData {
  return quai7;
}
