import { ITCard } from "@axzydev/axzy_ui_system";
import { FaArrowRight } from "react-icons/fa";

export const HomeCardItem = ({ item, index }: any) => {
  return (
    <ITCard
      onClick={item.action}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col justify-between h-full"
      key={index}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-2xl p-4 flex items-center justify-center w-14 h-14 transition-colors group-hover:bg-[var(--color-primary-600)] group-hover:text-white">
          <div className="text-2xl">{item.icon}</div>
        </div>
        <div className="bg-gray-50 rounded-full p-2 text-gray-400 group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-600)] transition-colors">
            <FaArrowRight className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[var(--color-primary-600)] transition-colors">
            {item.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
            {item.description}
        </p>
      </div>
    </ITCard>
  );
};
