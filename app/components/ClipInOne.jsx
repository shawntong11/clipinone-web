"use client";

import { useState, useRef } from "react";
import {
  ImagePlus,
  X,
  Flame,
  PartyPopper,
  Minus,
  Heart,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";

const LACQUER_DEEP = "#9E2B1E";
const LACQUER_DEEP2 = "#7A2016";
const PAPER = "#FBF6ED";
const PAGE_WASH = "#FBEAE2";
const LACQUER = "#D8432A";
const LACQUER_DARK = "#B8351F";
const JADE = "#2F6B5A";
const GOLD = "#C89A4C";
const TEXT_MUTED = "#A9776A";
const TEXT_INK = "#241F1B";

const STYLES = [
  {
    id: "viral",
    name: "网红探店风",
    tag: "VIRAL",
    desc: "快节奏 · 高饱和 · 抖音感BGM",
    icon: Flame,
    bg: LACQUER,
    bg2: LACQUER_DARK,
    fg: "#FFF6F0",
    caption: "巨好吃！必点！",
  },
  {
    id: "festive",
    name: "节日庆典风",
    tag: "FESTIVE",
    desc: "红金配色 · 促销强调 · 喜庆BGM",
    icon: PartyPopper,
    bg: LACQUER_DEEP,
    bg2: LACQUER_DEEP2,
    fg: GOLD,
    caption: "开业8周年 · 限时优惠",
  },
  {
    id: "minimal",
    name: "极简风",
    tag: "MINIMAL",
    desc: "留白多 · 慢节奏 · 电影感",
    icon: Minus,
    bg: PAPER,
    bg2: PAGE_WASH,
    fg: TEXT_INK,
    caption: "老王饭店",
    border: true,
  },
  {
    id: "cozy",
    name: "温馨风",
    tag: "COZY",
    desc: "暖色调 · 圆润字体 · 舒缓BGM",
    icon: Heart,
    bg: "#E7C9A9",
    bg2: "#DAB287",
    fg: "#5B3A20",
    caption: "家的味道",
  },
];

function StyleCard({ style, selected, onSelect }) {
  const Icon = style.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(style.id)}
      className="relative text-left rounded-lg overflow-hidden focus:outline-none"
      style={{
        border: selected ? `2px solid ${LACQUER}` : `2px solid transparent`,
        boxShadow: selected
          ? "0 6px 20px rgba(216,67,42,0.25)"
          : "0 1px 3px rgba(28,24,20,0.08)",
        transition: "all 180ms ease",
      }}
    >
      {/* poster preview */}
      <div
        className="relative w-full flex flex-col justify-between p-3"
        style={{
          height: "150px",
          background: style.bg,
          borderBottom: style.border ? `1px solid #F3D5C9` : "none",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs tracking-widest font-semibold"
            style={{ color: style.fg, opacity: 0.65, letterSpacing: "0.12em" }}
          >
            {style.tag}
          </span>
          <Icon size={16} style={{ color: style.fg, opacity: 0.85 }} />
        </div>
        <div
          className="font-bold"
          style={{
            color: style.fg,
            fontFamily: "'Noto Serif SC', serif",
            fontSize: style.id === "minimal" ? "15px" : "17px",
            lineHeight: 1.3,
          }}
        >
          {style.caption}
        </div>
        <div
          className="self-end rounded-full"
          style={{
            width: "26px",
            height: "26px",
            background: style.bg2,
            opacity: 0.9,
          }}
        />
      </div>

      {/* label */}
      <div
        className="px-3 py-2"
        style={{ background: PAPER }}
      >
        <div
          className="font-semibold text-sm"
          style={{ color: TEXT_INK, fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          {style.name}
        </div>
        <div className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>
          {style.desc}
        </div>
      </div>

      {/* selected seal */}
      {selected && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            top: "8px",
            right: "8px",
            width: "30px",
            height: "30px",
            background: LACQUER,
            borderRadius: "4px",
            transform: "rotate(-8deg)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          <Check size={16} color="#FFF6F0" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// 后端服务地址：优先读取环境变量 NEXT_PUBLIC_API_BASE
// 本地开发时在 .env.local 里设置，Vercel 部署时在项目设置的环境变量里配置
// 未设置时默认指向当前部署好的 DigitalOcean 服务器
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "https://159-223-175-193.sslip.io";

export default function ClipInOne() {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null); // { file, url }
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [dish, setDish] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [result, setResult] = useState(null); // { videoUrl, caption }
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = (fileList) => {
    const file = fileList[0];
    if (!file) return;
    setImage({ file, url: URL.createObjectURL(file) });
  };

  const removeImage = () => setImage(null);

  const missing = [];
  if (!image) missing.push("上传一张照片");
  if (!storeName.trim()) missing.push("填写店名");
  if (!tagline.trim()) missing.push("填写一句话卖点");
  if (!selectedStyle) missing.push("选择一个风格");

  const canSubmit = missing.length === 0 && status !== "submitting";

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("image", image.file);
      formData.append("storeName", storeName.trim());
      formData.append("tagline", tagline.trim());
      if (dish.trim()) formData.append("dish", dish.trim());
      formData.append("styleId", selectedStyle);

      const res = await fetch(`${API_BASE_URL}/api/generate-ai`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "生成失败，请重试");
      }

      setResult({
        videoUrl: `${API_BASE_URL}${data.videoUrl}`,
        caption: data.caption,
      });
      setStatus("done");
    } catch (err) {
      setErrorMsg(
        err.message === "Failed to fetch"
          ? "连不上服务器，请确认后端服务已启动"
          : err.message
      );
      setStatus("error");
    }
  };

  const selectedStyleObj = STYLES.find((s) => s.id === selectedStyle);

  return (
    <div style={{ background: PAGE_WASH, minHeight: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700;900&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="mx-auto"
        style={{
          maxWidth: "480px",
          fontFamily: "'Noto Sans SC', sans-serif",
        }}
      >
        {/* header */}
        <div
          className="px-6 pt-8 pb-7"
          style={{ background: LACQUER_DEEP }}
        >
          <div
            className="font-black"
            style={{
              color: PAPER,
              fontFamily: "'Noto Serif SC', serif",
              fontSize: "28px",
              letterSpacing: "0.01em",
            }}
          >
            ClipInOne
          </div>
          <div
            className="mt-1 text-sm"
            style={{ color: GOLD, letterSpacing: "0.02em" }}
          >
            真实素材，一键成片
          </div>
        </div>

        <div className="px-5 py-6 space-y-8">
          {/* step 01 upload */}
          <section>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className="text-xs font-bold"
                style={{ color: LACQUER, fontFamily: "'Noto Serif SC', serif" }}
              >
                01
              </span>
              <h2
                className="font-bold text-base"
                style={{ color: TEXT_INK }}
              >
                上传照片
              </h2>
            </div>

            {image ? (
              <div
                className="relative rounded-md overflow-hidden"
                style={{ height: "220px", background: "#00000010" }}
              >
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: "8px",
                    right: "8px",
                    width: "26px",
                    height: "26px",
                    background: "rgba(28,24,20,0.7)",
                    borderRadius: "9999px",
                  }}
                >
                  <X size={14} color="#fff" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-md"
                style={{
                  height: "220px",
                  border: `1.5px dashed #C9BBA5`,
                  color: TEXT_MUTED,
                }}
              >
                <ImagePlus size={22} />
                <span className="text-sm">点击上传一张照片</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files)}
            />

            <p className="text-xs mt-2" style={{ color: TEXT_MUTED }}>
              上传一张招牌菜或店内实拍照片，AI 会让画面动起来
            </p>
          </section>

          {/* step 02 info */}
          <section>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className="text-xs font-bold"
                style={{ color: LACQUER, fontFamily: "'Noto Serif SC', serif" }}
              >
                02
              </span>
              <h2 className="font-bold text-base" style={{ color: TEXT_INK }}>
                填写信息
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: TEXT_INK }}
                >
                  店名
                </label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="例：老王饭店"
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{
                    background: "#fff",
                    border: "1px solid #F3D5C9",
                    color: TEXT_INK,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: TEXT_INK }}
                >
                  一句话卖点
                </label>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="例：开业8年，老字号红烧肉"
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{
                    background: "#fff",
                    border: "1px solid #F3D5C9",
                    color: TEXT_INK,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: TEXT_INK }}
                >
                  招牌菜{" "}
                  <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                    （可选）
                  </span>
                </label>
                <input
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                  placeholder="例：红烧肉"
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{
                    background: "#fff",
                    border: "1px solid #F3D5C9",
                    color: TEXT_INK,
                  }}
                />
              </div>
            </div>
          </section>

          {/* step 03 style */}
          <section>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className="text-xs font-bold"
                style={{ color: LACQUER, fontFamily: "'Noto Serif SC', serif" }}
              >
                03
              </span>
              <h2 className="font-bold text-base" style={{ color: TEXT_INK }}>
                选择风格
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  selected={selectedStyle === style.id}
                  onSelect={setSelectedStyle}
                />
              ))}
            </div>
          </section>

          {/* result area: success */}
          {status === "done" && result && (
            <section
              className="rounded-lg p-4"
              style={{ background: "#fff", border: `1px solid #F3D5C9` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: "20px", height: "20px", background: JADE }}
                >
                  <Check size={12} color="#fff" strokeWidth={3} />
                </div>
                <span
                  className="font-semibold text-sm"
                  style={{ color: TEXT_INK }}
                >
                  视频已生成
                </span>
              </div>

              <video
                src={result.videoUrl}
                controls
                playsInline
                className="w-full rounded-md"
                style={{ background: "#000", maxHeight: "400px" }}
              />

              <p className="text-xs mt-2" style={{ color: TEXT_MUTED }}>
                字幕文案：<span style={{ color: TEXT_INK }}>{result.caption}</span>
              </p>

              <a
                href={result.videoUrl}
                download={`${storeName}-clipinone.mp4`}
                className="flex items-center justify-center gap-2 rounded-md py-2.5 mt-3 font-semibold text-sm"
                style={{ background: JADE, color: "#fff" }}
              >
                下载视频
              </a>
            </section>
          )}

          {/* result area: error */}
          {status === "error" && (
            <section
              className="rounded-lg p-4"
              style={{ background: "#fff", border: `1px solid ${LACQUER}` }}
            >
              <p className="text-sm font-semibold" style={{ color: LACQUER }}>
                生成失败
              </p>
              <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>
                {errorMsg}
              </p>
            </section>
          )}
        </div>

        {/* sticky CTA */}
        <div
          className="sticky bottom-0 px-5 py-4"
          style={{
            background: PAGE_WASH,
            borderTop: `1px solid #F3D5C9`,
          }}
        >
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-md py-3 font-semibold text-sm"
            style={{
              background: canSubmit ? LACQUER : "#F0D6CC",
              color: canSubmit ? "#FFF6F0" : "#B98F80",
              transition: "background 150ms ease",
            }}
          >
            {status === "submitting" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                生成中…
              </>
            ) : (
              <>
                生成 10 秒视频
                <ArrowRight size={16} />
              </>
            )}
          </button>
          {missing.length > 0 && status !== "submitting" && (
            <p className="text-xs mt-2 text-center" style={{ color: TEXT_MUTED }}>
              还差：{missing.join(" · ")}
            </p>
          )}
          {status === "submitting" && (
            <p className="text-xs mt-2 text-center" style={{ color: TEXT_MUTED }}>
              AI 正在生成动态画面，大约需要 1-3 分钟，请耐心等待
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
