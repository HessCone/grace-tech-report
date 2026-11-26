(function () {
  const FALLBACK = null; // filled after fetch failure from the same JSON if needed

  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.color = "#8a93a6";

  const tooltip = {
    backgroundColor: "#0b0d14",
    borderColor: "rgba(0,229,255,.4)",
    borderWidth: 1,
    padding: 12,
    titleFont: { family: "JetBrains Mono" },
    bodyFont: { family: "JetBrains Mono" },
  };

  function cyanFill(ctx, height) {
    const g = ctx.createLinearGradient(0, 0, 0, height || 340);
    g.addColorStop(0, "rgba(0,229,255,.35)");
    g.addColorStop(1, "rgba(0,229,255,0)");
    return g;
  }

  function chartHeight() {
    return window.matchMedia("(max-width: 600px)").matches ? 260 : 340;
  }

  function drawNvidia(data) {
    const canvas = document.getElementById("chart-nvidia");
    const ctx = canvas.getContext("2d");
    const reported = data.nvidia_revenue.filter((d) => !d.forecast);
    const last = reported[reported.length - 1];
    const outlook = data.nvidia_revenue.find((d) => d.forecast);
    const fill = cyanFill(ctx, chartHeight());

    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "NVIDIA revenue",
            data: reported.map((d) => ({ x: Date.parse(d.end + "T12:00:00-06:00"), y: d.y, label: d.label })),
            borderColor: "#00e5ff",
            backgroundColor: fill,
            fill: true,
            cubicInterpolationMode: "monotone",
            borderWidth: 2,
            pointBackgroundColor: "#00e5ff",
            pointBorderColor: "#00e5ff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Q4 FY27 outlook",
            data: [
              { x: Date.parse(last.end + "T12:00:00-06:00"), y: last.y, label: last.label },
              { x: Date.parse(outlook.end + "T12:00:00-06:00"), y: outlook.y, label: outlook.label },
            ],
            borderColor: "#ff3d71",
            backgroundColor: "transparent",
            cubicInterpolationMode: "monotone",
            borderWidth: 2,
            borderDash: [6, 5],
            pointBackgroundColor: ["#00e5ff", "#ff3d71"],
            pointBorderColor: ["#00e5ff", "#ff3d71"],
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip,
            callbacks: {
              title(items) {
                const d = items[0].raw;
                return d.label || items[0].label;
              },
              label(item) {
                const prefix = item.raw.label === "Q4 FY27 outlook" ? "Outlook " : "";
                return prefix + "$" + item.parsed.y.toFixed(1) + "B";
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "quarter" },
            grid: { color: "rgba(255,255,255,.05)" },
            ticks: { maxRotation: 0 },
          },
          y: {
            beginAtZero: false,
            grace: "8%",
            grid: { color: "rgba(255,255,255,.05)" },
            ticks: {
              callback(v) { return "$" + v + "B"; },
            },
          },
        },
      },
    });
  }

  function drawEvs(data) {
    const canvas = document.getElementById("chart-evs");
    const ctx = canvas.getContext("2d");
    const years = data.ev_sales.map((d) => d.year);
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: years,
        datasets: [
          {
            label: "Electric car sales",
            data: data.ev_sales.map((d) => (d.forecast ? null : d.y)),
            backgroundColor: "rgba(0,229,255,.75)",
            hoverBackgroundColor: "#00e5ff",
            borderColor: "#00e5ff",
            borderWidth: 0,
            borderRadius: 6,
          },
          {
            label: "IEA 2026 forecast",
            data: data.ev_sales.map((d) => (d.forecast ? d.y : null)),
            backgroundColor: "rgba(124,77,255,.75)",
            hoverBackgroundColor: "#7c4dff",
            borderColor: "#7c4dff",
            borderWidth: 0,
            borderRadius: 6,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip,
            callbacks: {
              label(item) {
                if (item.parsed.y == null) return null;
                const row = data.ev_sales[item.dataIndex];
                return row.note;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: "rgba(255,255,255,.05)" },
            ticks: { maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            stacked: true,
            grid: { color: "rgba(255,255,255,.05)" },
            ticks: {
              callback(v) { return v + "M"; },
            },
          },
        },
      },
    });
  }

  function drawCybercab(data) {
    const canvas = document.getElementById("chart-cybercab");
    const ctx = canvas.getContext("2d");
    const fill = cyanFill(ctx, chartHeight());
    const cc = data.texas_fleet.map((d) => ({
      x: Date.parse(d.t),
      y: d.cybercab,
      backfilled: !!d.backfilled,
    }));
    const my = data.texas_fleet.map((d) => ({
      x: Date.parse(d.t),
      y: d.modely,
      backfilled: !!d.backfilled,
    }));

    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Cybercab",
            data: cc,
            borderColor: "#00e5ff",
            backgroundColor: fill,
            fill: true,
            cubicInterpolationMode: "monotone",
            borderWidth: 3,
            pointBackgroundColor: cc.map((p) => (p.backfilled ? "#05060a" : "#00e5ff")),
            pointBorderColor: "#00e5ff",
            pointBorderWidth: 2,
            pointRadius: cc.map((p) => (p.backfilled ? 4 : 5)),
            pointHoverRadius: 7,
          },
          {
            label: "Model Y",
            data: my,
            borderColor: "#ff3d71",
            backgroundColor: "transparent",
            cubicInterpolationMode: "monotone",
            borderWidth: 2,
            borderDash: [6, 5],
            pointBackgroundColor: my.map((p) => (p.backfilled ? "#05060a" : "#ff3d71")),
            pointBorderColor: "#ff3d71",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip,
            callbacks: {
              label(item) {
                return item.dataset.label + ": " + item.parsed.y.toLocaleString("en-US");
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "week" },
            grid: { color: "rgba(255,255,255,.05)" },
            ticks: { maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,.05)" },
          },
        },
      },
    });
  }

  function drawSpace(data) {
    const canvas = document.getElementById("chart-space");
    const ctx = canvas.getContext("2d");
    const fill = cyanFill(ctx, chartHeight());
    const sx = data.spacex_monthly_cumulative.map((d) => ({ x: Date.parse(d.end + "T12:00:00Z"), y: d.spacex }));
    const rest = data.spacex_monthly_cumulative.map((d) => ({ x: Date.parse(d.end + "T12:00:00Z"), y: d.rest }));

    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "SpaceX",
            data: sx,
            borderColor: "#00e5ff",
            backgroundColor: fill,
            fill: true,
            cubicInterpolationMode: "monotone",
            borderWidth: 3,
            pointBackgroundColor: "#00e5ff",
            pointBorderColor: "#00e5ff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: "Rest of world",
            data: rest,
            borderColor: "#ff3d71",
            backgroundColor: "transparent",
            cubicInterpolationMode: "monotone",
            borderWidth: 2,
            borderDash: [6, 5],
            pointBackgroundColor: "#ff3d71",
            pointBorderColor: "#ff3d71",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip,
            callbacks: {
              label(item) {
                return item.dataset.label + ": " + item.parsed.y + " launches";
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "month" },
            grid: { color: "rgba(255,255,255,.05)" },
            ticks: { maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,.05)" },
          },
        },
      },
    });
  }

  function drawAll(data) {
    drawNvidia(data);
    drawEvs(data);
    drawCybercab(data);
    drawSpace(data);
  }

  fetch("report.json")
    .then((r) => {
      if (!r.ok) throw new Error("Could not load report data");
      return r.json();
    })
    .then(drawAll)
    .catch((err) => {
      console.error(err);
      const el = document.querySelector(".hero-lead");
      if (el) {
        el.textContent =
          "The charts need the data file at report.json. Open this site from a local server, not as a raw file.";
      }
    });
})();
