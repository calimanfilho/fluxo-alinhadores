import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const caseStatuses = a.enum([
  'received',
  'planned',
  'approved',
  'printed',
  'thermoformed',
  'trimmed',
  'polished',
  'quality',
  'delivered',
]);

const priorityLevels = a.enum(['low', 'normal', 'high', 'urgent']);

const archOptions = a.enum(['none', 'full', 'partial', 'pending']);

const schema = a.schema({
  Patient: a
    .model({
      name: a.string().required(),
      birthDate: a.date(),
      document: a.string(),
      phone: a.phone(),
      email: a.email(),
      notes: a.string(),
      alignerCases: a.hasMany('AlignerCase', 'patientId'),
    })
    .authorization((allow) => [allow.owner()]),

  AlignerCase: a
    .model({
      patientId: a.id().required(),
      patient: a.belongsTo('Patient', 'patientId'),
      caseNumber: a.string().required(),
      title: a.string().required(),
      status: caseStatuses,
      upperArch: archOptions,
      lowerArch: archOptions,
      quantityOfAligners: a.integer(),
      priority: priorityLevels,
      dueDate: a.date(),
      notes: a.string(),
      statusHistory: a.hasMany('CaseStatusHistory', 'caseId'),
      files: a.hasMany('CaseFile', 'caseId'),
    })
    .authorization((allow) => [allow.owner()]),

  CaseStatusHistory: a
    .model({
      caseId: a.id().required(),
      case: a.belongsTo('AlignerCase', 'caseId'),
      fromStatus: caseStatuses,
      toStatus: caseStatuses,
      note: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  CaseFile: a
    .model({
      caseId: a.id().required(),
      case: a.belongsTo('AlignerCase', 'caseId'),
      fileName: a.string().required(),
      fileKey: a.string().required(),
      contentType: a.string(),
      size: a.integer(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
