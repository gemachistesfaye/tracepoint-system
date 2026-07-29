import React from "react";

const QRCode = ({ value, size = 200, label }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg&margin=8`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <img
          src={qrUrl}
          alt={label || `QR code for ${value}`}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      {label && <p className="text-xs text-gray-400 font-medium">{label}</p>}
    </div>
  );
};

export default QRCode;
