import React from 'react';
import { Bot, HelpCircle } from 'lucide-react';
import AIChatPanel from '../components/AIChatPanel';

const SupportChat: React.FC = () => (
  <div className="mx-auto max-w-5xl space-y-6">
    <div className="rounded-[2rem] bg-slate-900 p-7 text-white shadow-xl sm:p-10">
      <div className="mb-5 inline-flex rounded-2xl bg-blue-600 p-3"><Bot size={25} /></div>
      <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300"><HelpCircle size={14} /> Trung tâm trợ giúp</p>
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Hỗ trợ Smart Store</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Hỏi về cách sử dụng hệ thống, quản lý sản phẩm, nhập hàng, bán hàng, tồn kho và ý nghĩa các kết quả phân tích.</p>
    </div>
    <AIChatPanel
      pageContext="support"
      title="Trợ lý hỗ trợ Smart Store"
      suggestions={['Cách tạo phiếu nhập hàng?', 'Tồn kho được cập nhật như thế nào?', 'Ý nghĩa tốc độ bán trung bình là gì?']}
    />
  </div>
);

export default SupportChat;
