import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { Contents } = await s3
      .listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME })
      .promise();
    const files = Contents.map((file) => ({
      name: file.Key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
    }));
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
