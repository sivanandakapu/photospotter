# Photo Spotter

Photo Spotter is a web application that helps event photographers share photos with guests using facial recognition. When photographers upload photos, the app automatically matches faces with registered guests.

## Features

- Event creation and management
- Guest registration with selfie capture
- Photo upload with drag-and-drop support
- Automatic face matching using AWS Rekognition

## Prerequisites

- Node.js 18 or later
- AWS account with DynamoDB, S3, and Rekognition access

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photo-spotter.git
cd photo-spotter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-2
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret
COGNITO_ISSUER=https://your-domain.auth.us-east-2.amazoncognito.com
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# S3 and CDN Configuration
S3_BUCKET_ORIGINALS=photos--db
REKOG_COLLECTION=event-spotter-collection
CDN_DOMAIN=d23qazmttrl3im.cloudfront.net
```

4. Create DynamoDB tables:
```bash
aws dynamodb create-table \
  --table-name PhotoSpotterEvents \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
  --table-name PhotoSpotterGuests \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=eventId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"EventIdIndex\",
      \"KeySchema\": [{\"AttributeName\":\"eventId\",\"KeyType\":\"HASH\"}],
      \"Projection\": {\"ProjectionType\":\"ALL\"},
      \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
    }]" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
  --table-name PhotoSpotterPhotos \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=eventId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"EventIdIndex\",
      \"KeySchema\": [{\"AttributeName\":\"eventId\",\"KeyType\":\"HASH\"}],
      \"Projection\": {\"ProjectionType\":\"ALL\"},
      \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
    }]" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
  --table-name PhotoSpotterPhotoMatches \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=photoId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "[{
      \"IndexName\": \"PhotoIdIndex\",
      \"KeySchema\": [{\"AttributeName\":\"photoId\",\"KeyType\":\"HASH\"}],
      \"Projection\": {\"ProjectionType\":\"ALL\"},
      \"ProvisionedThroughput\": {\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
    }]" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

5. Create the AWS Rekognition collection:
```bash
aws rekognition create-collection --collection-id "PhotoSpotterFaces" --region your_aws_region
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## AWS Setup

1. Create an S3 bucket for storing photos
2. Create an IAM user with the following permissions:
   - AmazonDynamoDBFullAccess
   - AmazonS3FullAccess
   - AmazonRekognitionFullAccess
3. Create a Cognito user pool and app client:
   - Enable the Authorization Code grant flow
   - Set callback URL to `http://localhost:3000/api/auth/callback/cognito`
   - Note the user pool domain, client ID and client secret
4. Configure CORS for the S3 bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": []
    }
]
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 