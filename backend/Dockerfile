# Note: This file is still non-functional, these are here only for reference

COPY prisma ./prisma/
RUN npx prisma generate

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1