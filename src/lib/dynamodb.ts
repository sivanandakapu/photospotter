import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const EVENTS_TABLE = 'PhotoSpotterEvents';
const GUESTS_TABLE = 'PhotoSpotterGuests';
const PHOTOS_TABLE = 'PhotoSpotterPhotos';
const PHOTO_FACES_TABLE = 'PhotoSpotterPhotoFaces';
const PHOTO_MATCHES_TABLE = 'PhotoSpotterPhotoMatches';

// Event functions
export async function createEvent(data: { name: string; date: string }) {
  const event = {
    id: uuidv4(),
    ...data,
  };

  await docClient.send(new PutCommand({
    TableName: EVENTS_TABLE,
    Item: event,
  }));

  return event;
}

export async function getEvents() {
  const result = await docClient.send(new ScanCommand({
    TableName: EVENTS_TABLE,
  }));

  return result.Items || [];
}

export async function getEvent(id: string) {
  const result = await docClient.send(new GetCommand({
    TableName: EVENTS_TABLE,
    Key: { id },
  }));

  return result.Item;
}

// Guest functions
export async function createGuest(data: {
  name: string;
  email: string;
  phone: string;
  eventId: string;
  selfieUrl: string;
}) {
  const guest = {
    id: uuidv4(),
    ...data,
  };

  await docClient.send(new PutCommand({
    TableName: GUESTS_TABLE,
    Item: guest,
  }));

  return guest;
}

export async function getEventGuests(eventId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: GUESTS_TABLE,
    IndexName: 'EventIdIndex',
    KeyConditionExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':eventId': eventId,
    },
  }));

  return result.Items || [];
}

export async function getGuest(id: string) {
  const result = await docClient.send(new GetCommand({
    TableName: GUESTS_TABLE,
    Key: { id },
  }));

  return result.Item;
}

// Photo functions
export async function createPhoto(data: { 
  url: string; 
  eventId: string;
}) {
  const photo = {
    id: uuidv4(),
    ...data,
  };

  await docClient.send(new PutCommand({
    TableName: PHOTOS_TABLE,
    Item: photo,
  }));

  return photo;
}

export async function getPhoto(id: string) {
  const result = await docClient.send(new GetCommand({
    TableName: PHOTOS_TABLE,
    Key: { id },
  }));

  return result.Item;
}

export async function getEventPhotos(eventId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: PHOTOS_TABLE,
    IndexName: 'EventIdIndex',
    KeyConditionExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':eventId': eventId,
    },
  }));

  return result.Items || [];
}

// Photo faces functions
export async function createPhotoFace(data: {
  photoId: string;
  faceId: string;
  confidence: number;
  boundingBox: {
    Height: number;
    Left: number;
    Top: number;
    Width: number;
  };
}) {
  const face = {
    id: uuidv4(),
    ...data,
  };

  await docClient.send(new PutCommand({
    TableName: PHOTO_FACES_TABLE,
    Item: face,
  }));

  return face;
}

export async function getPhotoFaces(photoId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: PHOTO_FACES_TABLE,
    IndexName: 'PhotoIdIndex',
    KeyConditionExpression: 'photoId = :photoId',
    ExpressionAttributeValues: {
      ':photoId': photoId,
    },
  }));

  return result.Items || [];
}

export async function getFacesByFaceId(faceId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: PHOTO_FACES_TABLE,
    IndexName: 'FaceIdIndex',
    KeyConditionExpression: 'faceId = :faceId',
    ExpressionAttributeValues: {
      ':faceId': faceId,
    },
  }));

  return result.Items || [];
}

// Photo matches functions
export async function createPhotoMatch(data: {
  photoId: string;
  guestId: string;
  confidence: number;
}) {
  const match = {
    id: uuidv4(),
    ...data,
  };

  await docClient.send(new PutCommand({
    TableName: PHOTO_MATCHES_TABLE,
    Item: match,
  }));

  return match;
}

export async function getPhotoMatches(guestId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: PHOTO_MATCHES_TABLE,
    IndexName: 'GuestIdIndex',
    KeyConditionExpression: 'guestId = :guestId',
    ExpressionAttributeValues: {
      ':guestId': guestId,
    },
  }));

  return result.Items || [];
} 