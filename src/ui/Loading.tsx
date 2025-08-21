import loading from "../assets/gifs/loading.gif";
import { colors } from "../theme/colors";

const Loading: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      style={{ backgroundColor: colors.background.page }}
    >
      <div
        className="relative p-8 rounded-2xl shadow-lg border"
        style={{
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
          boxShadow: colors.shadow.md,
        }}
      >
        <img className="w-12 h-12 mx-auto mb-4" src={loading} alt="loading" />
        <p
          className="text-sm font-medium text-center"
          style={{ color: colors.text.secondary }}
        >
          Loading dashboard data...
        </p>
      </div>
    </div>
  );
};

export default Loading;
