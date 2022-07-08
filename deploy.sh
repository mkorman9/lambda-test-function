#!/bin/bash

FUNCTION_NAME="$1"

aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://dist/function.zip
