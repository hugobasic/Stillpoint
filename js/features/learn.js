"use strict";

/* ============================================================
   Learn — course catalog + sub-pages
   A data-driven list of short courses. Each course renders its
   own routed sub-page with a few example lesson videos.
   ============================================================ */

// Videos come from the "PlayWell7 Program English" YouTube playlist.
// Each video is named after its course — paste the matching video ID into `yt`:
//   https://youtube.com/playlist?list=PLjQ1Sg3_ftMDvyAwpStgivC__8rePLHVM
// The ID is the part after `v=` in a watch URL, e.g. 'dQw4w9WgXcQ'.
const COURSES = [
  {
    id: "intro",
    title: "Intro",
    blurb: "Orient yourself and set the tone for the journey ahead.",
    yt: "2TLd02edtys",
  },
  {
    id: "calm",
    title: "Calm",
    blurb: "We start with the basics of mental relaxation, the power of laughter, and the importance of reflecting on the three best events of the day.",
    yt: "aFIklPiPPOA",
  },
  {
    id: "acceptance",
    title: "Acceptance",
    blurb: "Learn to accept your feelings and thoughts without judging them, a key to mental strength.",
    yt: "Yjisv-cQZ_w",
  },
  {
    id: "situation",
    title: "Situation",
    blurb: "We explore the power of “CBT” and learn to analyze “situations” and understand thoughts, feelings, and ultimately the behavior we want to achieve.",
    yt: "Q5p_6VUpSUM",
  },
  {
    id: "goals",
    title: "Goals",
    blurb: "We focus on setting the right type of goals and not always just focusing on the results.",
    yt: "5njq1k-kQt0",
  },
  {
    id: "evaluations",
    title: "Evaluations",
    blurb: "We reflect on our progress and learn to see and appreciate our own development.",
    yt: "7kpH1W1cf3E",
  },
  {
    id: "tailwind",
    title: "Tailwind",
    blurb: "Learn to find and maintain a state of flow, where you are completely absorbed in what you are doing and performing at your best.",
    yt: "JfRWK5oL8ps",
  },
  {
    id: "celebration",
    title: "Celebration",
    blurb: "We conclude by celebrating our successes and set new goals for the future.",
    yt: "p3lWRXH5p_s",
  },
];

const courseRoute = (id) => "learn-" + id;

function videoMarkup(course) {
  if (!course.yt) {
    return `
      <div class="video-frame video-frame--empty">
        <div class="video-placeholder">
          <span class="video-placeholder__icon" aria-hidden="true">▶</span>
          <span>Video coming soon</span>
        </div>
      </div>`;
  }
  const src = `https://www.youtube-nocookie.com/embed/${course.yt}?rel=0`;
  return `
    <div class="video-frame">
      <iframe class="lesson-embed" data-src="${src}" title="${course.title}"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>
    </div>`;
}

function courseCard(course, order) {
  return `
    <a class="course-card" href="#${courseRoute(course.id)}">
      <span class="course-index">${String(order).padStart(2, "0")}</span>
      <span class="course-info">
        <strong>${course.title}</strong>
        <small>${course.blurb}</small>
      </span>
      <span class="course-chevron" aria-hidden="true">›</span>
    </a>`;
}

function indexView() {
  const cards = COURSES.map((c, i) => courseCard(c, i + 1)).join("");
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
  return `
    <section class="view" id="view-${courseRoute(course.id)}" data-route="${courseRoute(course.id)}">
      <header class="topbar">
        <a class="back" href="#learn" aria-label="Back">‹</a>
        <h2>${course.title}</h2>
      </header>
      <div class="scroll">
        <p class="course-blurb">${course.blurb}</p>
        ${videoMarkup(course)}
      </div>
    </section>`;
}

export const template = indexView() + COURSES.map(courseView).join("");

export const routes = ["learn", ...COURSES.map((c) => courseRoute(c.id))];

/* Load only the course video on the active view and unload every other one.
   Navigating a hidden iframe to about:blank destroys its player, so playback
   stops immediately on navigation — not just when another course is opened. */
export function syncVideos() {
  document.querySelectorAll("#app iframe.lesson-embed").forEach((f) => {
    const active = f.closest(".view").classList.contains("active");
    const real = f.dataset.src;
    const current = f.getAttribute("src");
    if (active) {
      if (current !== real) f.setAttribute("src", real);
    } else if (current && current !== "about:blank") {
      f.setAttribute("src", "about:blank");
    }
  });
}
