import PropTypes from 'prop-types';

const tones = {
  indigo: 'bg-indigo-600',
  violet: 'bg-violet-600',
  pink: 'bg-pink-500',
  teal: 'bg-teal-600',
};

/** Render a dashboard statistic with a consistent color treatment.
 * @param {{label: string, value: number, tone?: string}} props Statistic properties.
 * @returns {JSX.Element} Statistic card.
 */
export default function StatCard({ label, value, tone = 'indigo' }) {
  return (
    <article className={`rounded-2xl p-6 text-white shadow-sm ${tones[tone] || tones.indigo}`}>
      <p className="text-sm font-semibold text-white/85">{label}</p>
      <p className="mt-3 font-display text-4xl font-extrabold tabular-nums" role="status">{value}</p>
    </article>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.string,
};
