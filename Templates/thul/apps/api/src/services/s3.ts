import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

export const s3 = new S3Client({
  region: process.env['AWS_REGION'] ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
  },
})

const BUCKET = process.env['S3_BUCKET_NAME'] ?? 'shopflow-assets'
const CDN = process.env['CLOUDFRONT_URL'] ?? ''

export async function getPresignedUploadUrl(contentType: string, folder = 'products') {
  const ext = contentType.split('/')[1] ?? 'jpg'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  )

  const publicUrl = CDN ? `${CDN}/${key}` : `https://${BUCKET}.s3.amazonaws.com/${key}`
  return { uploadUrl: url, publicUrl, key }
}

export async function deleteS3Object(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
