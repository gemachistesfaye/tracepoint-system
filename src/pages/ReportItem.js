import React from "react";
import ReportItemForm from "../components/items/ReportItemForm";
import { PlusCircle } from "lucide-react";

const ReportItem = () => (
  <div className="max-w-2xl mx-auto px-4 py-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
        <PlusCircle size={22} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report an Item</h1>
        <p className="text-sm text-gray-500">Fill in the details below to submit your report</p>
      </div>
    </div>
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <ReportItemForm />
    </div>
  </div>
);

export default ReportItem;
