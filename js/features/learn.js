'use strict';

/* ============================================================
   Learn — course catalog + sub-pages
   A data-driven list of short courses. Each course renders its
   own routed sub-page with a few example lesson videos.
   ============================================================ */

// Public Google sample media — stand-ins to showcase a course schedule.
const VIDEO_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';

const COURSES = [
  {
    id: 'intro',
    title: 'Intro',
    blurb: 'Orient yourself and set the tone for the journey ahead.',
    lessons: [
      { title: 'Welcome to Stillpoint', duration: '4 min', file: 'BigBuckBunny.mp4' },
      { title: 'How this course works', duration: '6 min', file: 'ElephantsDream.mp4' },
      { title: 'Building a daily habit', duration: '5 min', file: 'ForBiggerFun.mp4' }
    ]
  },
  {
    id: 'calm',
    title: 'Calm',
    blurb: 'Simple practices to steady your body and quiet the mind.',
    lessons: [
      { title: 'The physiology of calm', duration: '7 min', file: 'ForBiggerBlazes.mp4' },
      { title: 'A five-minute reset', duration: '5 min', file: 'ForBiggerEscapes.mp4' }
    ]
  },
  {
    id: 'acceptance',
    title: 'Acceptance',
    blurb: 'Make room for what is, without the struggle.',
    lessons: [
      { title: "What acceptance is (and isn't)", duration: '8 min', file: 'ForBiggerJoyrides.mp4' },
      { title: 'Softening resistance', duration: '6 min', file: 'ForBiggerMeltdowns.mp4' }
    ]
  },
  {
    id: 'situation',
    title: 'Situation',
    blurb: 'Break down a difficult moment and learn from it.',
    lessons: [
      { title: 'Anatomy of a hard moment', duration: '9 min', file: 'Sintel.mp4' },
      { title: 'Reframing the story', duration: '7 min', file: 'TearsOfSteel.mp4' }
    ]
  },
  {
    id: 'goals',
    title: 'Goals',
    blurb: 'Turn intentions into small, achievable steps.',
    lessons: [
      { title: 'Choosing what matters', duration: '6 min', file: 'WhatCarCanYouGetForAGrand.mp4' },
      { title: 'Small steps, big change', duration: '5 min', file: 'VolkswagenGTIReview.mp4' },
      { title: 'Tracking without pressure', duration: '7 min', file: 'SubaruOutbackOnStreetAndDirt.mp4' }
    ]
  },
  {
    id: 'evaluations',
    title: 'Evaluations',
    blurb: 'Reflect on progress with honesty and kindness.',
    lessons: [
      { title: 'A kind weekly review', duration: '6 min', file: 'WeAreGoingOnBubbleField.mp4' },
      { title: 'Learning from setbacks', duration: '8 min', file: 'ForBiggerMeltdowns.mp4' }
    ]
  },
  {
    id: 'tailwind',
    title: 'Tailwind',
    blurb: 'Build momentum and let good habits carry you.',
    lessons: [
      { title: 'Riding your momentum', duration: '5 min', file: 'ForBiggerEscapes.mp4' },
      { title: 'Systems over willpower', duration: '7 min', file: 'ForBiggerJoyrides.mp4' }
    ]
  },
  {
    id: 'celebration',
    title: 'Celebration',
    blurb: 'Notice and honour how far you have come.',
    lessons: [
      { title: 'Why celebration matters', duration: '5 min', file: 'BigBuckBunny.mp4' },
      { title: 'Marking small wins', duration: '4 min', file: 'ElephantsDream.mp4' },
      { title: 'Sharing your progress', duration: '6 min', file: 'Sintel.mp4' }
    ]
  }
];

const courseRoute = id => 'learn-' + id;

function lessonMarkup(lesson, i) {
  return `
    <article class="lesson">
      <div class="lesson-head">
        <span class="lesson-num">${i + 1}</span>
        <div class="lesson-meta">
          <strong>${lesson.title}</strong>
          <small>${lesson.duration}</small>
        </div>
      </div>
      <div class="video-frame">
        <video controls preload="none" playsinline src="${VIDEO_BASE}${lesson.file}"></video>
      </div>
    </article>`;
}

function courseCard(course, order) {
  return `
    <a class="course-card" href="#${courseRoute(course.id)}">
      <span class="course-index">${String(order).padStart(2, '0')}</span>
      <span class="course-info">
        <strong>${course.title}</strong>
        <small>${course.blurb}</small>
      </span>
      <span class="course-chevron" aria-hidden="true">›</span>
    </a>`;
}

function indexView() {
  const cards = COURSES.map((c, i) => courseCard(c, i + 1)).join('');
  return `
    <section class="view" id="view-learn" data-route="learn">
      <header class="topbar">
        <a class="back" href="#home" aria-label="Back">‹</a>
        <h2>Learn</h2>
      </header>
      <div class="scroll">
        <p class="learn-lead">Eight short courses to guide your practice, one step at a time.</p>
        <div class="course-list">${cards}</div>
      </div>
    </section>`;
}

function courseView(course) {
  const lessons = course.lessons.map(lessonMarkup).join('');
  return `
    <section class="view" id="view-${courseRoute(course.id)}" data-route="${courseRoute(course.id)}">
      <header class="topbar">
        <a class="back" href="#learn" aria-label="Back">‹</a>
        <h2>${course.title}</h2>
      </header>
      <div class="scroll">
        <p class="course-blurb">${course.blurb}</p>
        <div class="lesson-list">${lessons}</div>
      </div>
    </section>`;
}

export const template = indexView() + COURSES.map(courseView).join('');

export const routes = ['learn', ...COURSES.map(c => courseRoute(c.id))];

/* Pause any playing lesson video when leaving a course sub-page. */
export function pauseAllVideos() {
  document.querySelectorAll('#app video').forEach(v => {
    if (!v.paused) v.pause();
  });
}
