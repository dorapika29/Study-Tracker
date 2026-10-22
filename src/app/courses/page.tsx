'use client';

import { Layout } from '@/components/layout/Layout';
import { CourseList } from '@/components/courses/CourseList';

export default function CoursesPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]">Courses</h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">Manage your courses and topics</p>
        </div>
        <CourseList />
      </div>
    </Layout>
  );
}