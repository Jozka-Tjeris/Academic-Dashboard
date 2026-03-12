export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", id] as const,
    dashboard: (id: string) => ["courses", id, "dashboard"] as const,
  },

  dashboard: {
    global: ["dashboard"] as const,
  },

  assessments: {
    collisions: ["assessments", "collisions"] as const,
  },

  auth: {
    me: ["auth", "me"] as const,
  }
};
