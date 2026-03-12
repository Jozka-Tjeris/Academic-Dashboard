export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", id] as const,
  },

  dashboard: {
    course: (id: string) => ["courses", id, "dashboard"] as const,
    global: ["dashboard"] as const,
  },

  assessments: {
    all: ["assessments"] as const,
    detail: (id: string) => ["assessments", id] as const,
  },

  collisions: ["collisions"] as const,

  auth: {
    me: ["api", "auth", "me"] as const,
    logout: ["api", "auth", "logout"] as const,
  }
};
