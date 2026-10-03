# Photos

Photo metadata and upload orchestration boundary. Authorize and rate-limit before S3 presigning; bind completion to the issued upload and verify S3 metadata. Insert photos only after upload verification. Store s3Key; deletion coordinates MongoDB and S3.

Implementation is deferred. Follow /docs and the pending decisions in /docs/FOUNDATION_DECISIONS.md.

