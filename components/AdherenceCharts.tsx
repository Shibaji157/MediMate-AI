"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DailyPoint = {
  date: string;
  label: string;

  scheduled: number;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;

  adherence: number | null;
};

type AdherenceChartsProps = {
  daily: DailyPoint[];

  taken: number;
  missed: number;
  skipped: number;
};

export default function AdherenceCharts({
  daily,
  taken,
  missed,
  skipped,
}: AdherenceChartsProps) {
  const trendData =
    daily.map((day) => ({
      ...day,

      adherence:
        day.adherence ?? 0,
    }));

  const outcomeData = [
    {
      name: "Taken",
      value: taken,
      fill: "#087f6a",
    },

    {
      name: "Missed",
      value: missed,
      fill: "#dc2626",
    },

    {
      name: "Skipped",
      value: skipped,
      fill: "#d97706",
    },
  ];

  const hasOutcomeData =
    taken +
      missed +
      skipped >
    0;

  return (
    <div className="space-y-6">
      {/* =========================================
          ADHERENCE TREND
      ========================================= */}

      <section className="rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold text-[#087f6a]">
            Trend
          </p>

          <h2 className="mt-1 text-xl font-black text-[#10231f]">
            7-Day Adherence
          </h2>

          <p className="mt-1 text-sm text-[#71847f]">
            Percentage of recorded
            scheduled doses marked as
            taken each day.
          </p>
        </div>

        <div className="mt-7 h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={trendData}
              margin={{
                top: 10,
                right: 15,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e8efed"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#71847f",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                ticks={[
                  0,
                  25,
                  50,
                  75,
                  100,
                ]}
                tickFormatter={(
                  value
                ) =>
                  `${value}%`
                }
                tick={{
                  fill: "#71847f",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(
                  value
                ) => [
                  `${value}%`,
                  "Adherence",
                ]}
              />

              <Line
                type="monotone"
                dataKey="adherence"
                stroke="#087f6a"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "#087f6a",
                }}
                activeDot={{
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =========================================
          DAILY OUTCOMES
      ========================================= */}

      <section className="rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold text-[#087f6a]">
            Daily Activity
          </p>

          <h2 className="mt-1 text-xl font-black text-[#10231f]">
            Dose Outcomes by Day
          </h2>

          <p className="mt-1 text-sm text-[#71847f]">
            Taken, missed and skipped
            medication records across the
            last seven days.
          </p>
        </div>

        <div className="mt-7 h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={daily}
              margin={{
                top: 10,
                right: 15,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e8efed"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#71847f",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: "#71847f",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="taken"
                name="Taken"
                fill="#087f6a"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
              />

              <Bar
                dataKey="missed"
                name="Missed"
                fill="#dc2626"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
              />

              <Bar
                dataKey="skipped"
                name="Skipped"
                fill="#d97706"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =========================================
          OUTCOME DISTRIBUTION
      ========================================= */}

      <section className="rounded-[28px] border border-[#dfeae7] bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold text-[#087f6a]">
            Distribution
          </p>

          <h2 className="mt-1 text-xl font-black text-[#10231f]">
            Recorded Dose Outcomes
          </h2>
        </div>

        {hasOutcomeData ? (
          <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
            <div className="h-[260px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={outcomeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {outcomeData.map(
                      (
                        item,
                        index
                      ) => (
                        <Cell
                          key={`${item.name}-${index}`}
                          fill={
                            item.fill
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <OutcomeRow
                label="Taken"
                value={taken}
                dotClass="bg-[#087f6a]"
              />

              <OutcomeRow
                label="Missed"
                value={missed}
                dotClass="bg-red-600"
              />

              <OutcomeRow
                label="Skipped"
                value={skipped}
                dotClass="bg-amber-600"
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-[#f5faf8] p-8 text-center">
            <p className="font-bold text-[#526a63]">
              No recorded dose outcomes
              yet.
            </p>

            <p className="mt-2 text-sm text-[#71847f]">
              Taken, missed and skipped
              doses will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function OutcomeRow({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#f7fbfa] p-4">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${dotClass}`}
        />

        <span className="text-sm font-bold text-[#526a63]">
          {label}
        </span>
      </div>

      <span className="text-lg font-black text-[#10231f]">
        {value}
      </span>
    </div>
  );
}