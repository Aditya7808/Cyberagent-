output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "Secure S3 documents bucket"
  value       = aws_s3_bucket.documents.bucket
}

output "kms_key_arn" {
  description = "KMS Customer Managed Key ARN"
  value       = aws_kms_key.s3_key.arn
}

