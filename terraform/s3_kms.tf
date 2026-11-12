resource "aws_kms_key" "s3_key" {
  description             = "KMS Key for SentinelAI Document Storage at rest"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "${var.app_name}-kms-key"
  }
}

resource "aws_s3_bucket" "documents" {
  bucket        = "${var.app_name}-documents-${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.s3_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

