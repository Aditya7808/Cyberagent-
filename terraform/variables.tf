variable "aws_region" {
  description = "Target AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "sentinel-ai"
}

variable "db_password" {
  description = "PostgreSQL database master password"
  type        = string
  sensitive   = true
  default     = "SentinelProdPassword2026!"
}

