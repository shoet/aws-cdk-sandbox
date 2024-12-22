.DEFAULT_GOAL := help

default_stage := dev
STAGE ?= $(default_stage)

synth: ## Synthesize CloudFormation template
	STAGE=${STAGE} cdk synth "${STAGE}/**"

deploy: ## Deploy CloudFormation stack
	STAGE=${STAGE} cdk deploy "${STAGE}/**"

remove: ## Remove CloudFormation stack
	STAGE=${STAGE} cdk destroy "${STAGE}/**"

.PHONY: help
help: ## Show options
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
