import React, { useState } from 'react';
import {
  X, Settings2, RotateCcw, ArrowUp, ArrowDown, Eye, EyeOff,
  FileText, Layout, Type, HelpCircle, Stamp, Sparkles, UserCheck, BookMarked, CheckCircle2
} from 'lucide-react';
import {
  PAGE_SIZES, MARGIN_PRESETS, FONT_OPTIONS, SECTION_META, DEFAULT_PRINT_SETTINGS, INSTRUCTION_PRESETS,
} from '../../printSettings.js';

const Group = ({ title, icon: Icon, children }) => (
  <section className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 shadow-sm transition-all hover:border-slate-300">
    <div className="mb-3 flex items-center gap-2">
      {Icon && (
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
          <Icon className="h-3 w-3" />
        </span>
      )}
      <h3 className="text-xs font-black text-slate-800 tracking-wide">{title}</h3>
    </div>
    {children}
  </section>
);

const Segmented = ({ value, options, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-slate-200/70 p-1">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
          value === o.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const NumberRow = ({ label, value, min, max, step = 1, suffix, onChange }) => (
  <label className="flex items-center gap-3 py-1">
    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-24 shrink-0 cursor-pointer accent-indigo-600"
    />
    <span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums text-slate-700">
      {value}{suffix}
    </span>
  </label>
);

const Toggle = ({ label, checked, onChange, description }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
    <div className="min-w-0 flex-1">
      <span className="block text-xs font-semibold text-slate-700">{label}</span>
      {description && <span className="block text-[10px] text-slate-400">{description}</span>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  </label>
);

const PrintSettingsPanel = React.memo(({ isOpen, onClose, settings, onChange, onReset }) => {
  const set = (patch) => onChange({ ...settings, ...patch });
  const [activeTab, setActiveTab] = useState('layout'); // layout | typography | elements | tags | watermark

  const moveSection = (id, dir) => {
    const order = [...settings.sectionOrder];
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    set({ sectionOrder: order });
  };

  const toggleSection = (id) => {
    const hidden = settings.hiddenSections.includes(id)
      ? settings.hiddenSections.filter((s) => s !== id)
      : [...settings.hiddenSections, id];
    set({ hiddenSections: hidden });
  };

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 print:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <aside className={`absolute bottom-0 right-0 top-0 flex w-full max-w-[430px] flex-col border-l border-slate-300 bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-500/20">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-800">পেজ ও প্রিন্ট সেটআপ</h2>
              <p className="text-[11px] font-medium text-slate-500">প্রিন্ট ও মাস্টার কপি ফরম্যাটিং</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onReset}
              title="ডিফল্ট সেটিংসে ফিরুন"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid shrink-0 grid-cols-5 gap-1 border-b border-slate-200 bg-white p-2">
          {[
            { id: 'layout', label: 'লেআউট', icon: Layout },
            { id: 'typography', label: 'ফন্ট', icon: Type },
            { id: 'tags', label: 'ট্যাগ', icon: CheckCircle2 },
            { id: 'elements', label: 'হেডার', icon: UserCheck },
            { id: 'watermark', label: 'জলছাপ', icon: Stamp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-bold leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-4 custom-scrollbar">
          {/* TAB: BOARD, TYPE & ANSWERS */}
          {activeTab === 'tags' && (
            <>
              <Group title="বোর্ড ও প্রশ্নের তথ্য প্রদর্শন" icon={BookMarked}>
                <div className="space-y-1">
                  <Toggle
                    label="বোর্ডের নাম ও সাল দেখান"
                    description="যেমন: [ঢা. বো. ২০২৪, রা. বো. ২০২৩]"
                    checked={settings.showBoardNames}
                    onChange={(v) => set({ showBoardNames: v })}
                  />
                  <Toggle
                    label="প্রশ্নের ধরন ও টপিক দেখান"
                    description="যেমন: [জ্ঞানমূলক], [সৃজনশীল], [টপিক: ...]"
                    checked={settings.showQuestionType}
                    onChange={(v) => set({ showQuestionType: v })}
                  />
                </div>
              </Group>

              <Group title="মাস্টার সলিউশন শিট (সরাসরি উত্তর ও সমাধান)" icon={CheckCircle2}>
                <div className="space-y-2">
                  <Toggle
                    label="প্রশ্নপত্রে সরাসরি উত্তর প্রিন্ট করুন"
                    description="শিক্ষক / গাইড মাস্টার কপির জন্য প্রশ্নপত্রের ভেতরেই উত্তর থাকবে"
                    checked={settings.showAnswersInline}
                    onChange={(v) => set({ showAnswersInline: v })}
                  />
                  {settings.showAnswersInline && (
                    <div className="pt-2 border-t border-slate-200">
                      <Toggle
                        label="MCQ-এর সাথে ব্যাখ্যা (Explanation) দেখান"
                        description="যেসব প্রশ্নের বিস্তারিত ব্যাখ্যা রয়েছে তা প্রিন্ট করবে"
                        checked={settings.showExplanation}
                        onChange={(v) => set({ showExplanation: v })}
                      />
                    </div>
                  )}
                </div>
              </Group>
            </>
          )}

          {/* TAB 1: LAYOUT & PAPER */}
          {activeTab === 'layout' && (
            <>
              <Group title="কাগজের সাইজ ও ওরিয়েন্টেশন" icon={FileText}>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500">সাইজ নির্বাচন করুন:</p>
                  <Segmented
                    value={settings.pageSize}
                    onChange={(v) => set({ pageSize: v })}
                    options={Object.entries(PAGE_SIZES).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                  <p className="text-[11px] font-semibold text-slate-500 pt-1">পৃষ্ঠা ঘোরান:</p>
                  <Segmented
                    value={settings.orientation}
                    onChange={(v) => set({ orientation: v })}
                    options={[
                      { value: 'portrait', label: 'লম্বালম্বি (Portrait)' },
                      { value: 'landscape', label: 'আড়াআড়ি (Landscape)' },
                    ]}
                  />
                </div>
              </Group>

              <Group title="মার্জিন (Margins)" icon={Layout}>
                <div className="space-y-2">
                  <Segmented
                    value={settings.marginPreset}
                    onChange={(v) => set({ marginPreset: v, margin: { ...MARGIN_PRESETS[v] } })}
                    options={[
                      ...Object.entries(MARGIN_PRESETS).map(([k, v]) => ({ value: k, label: v.label })),
                      { value: 'custom', label: 'কাস্টম' },
                    ]}
                  />
                  {settings.marginPreset === 'custom' && (
                    <div className="mt-2.5 grid grid-cols-2 gap-x-3 rounded-xl bg-white p-2.5 border border-slate-200">
                      {[['top', 'উপরে'], ['bottom', 'নিচে'], ['left', 'বামে'], ['right', 'ডানে']].map(([key, label]) => (
                        <NumberRow
                          key={key}
                          label={label}
                          value={settings.margin[key]}
                          min={0}
                          max={35}
                          suffix="mm"
                          onChange={(n) => set({ margin: { ...settings.margin, [key]: n } })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Group>

              <Group title="প্রশ্নের ঘনত্ব ও ব্যবধান" icon={Sparkles}>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500">প্রশ্নের মধ্যবর্তী দূরত্ব:</p>
                  <Segmented
                    value={settings.spacingPreset || 'normal'}
                    onChange={(v) => set({ spacingPreset: v })}
                    options={[
                      { value: 'compact', label: 'কমপ্যাক্ট (ঘন)' },
                      { value: 'normal', label: 'স্বাভাবিক' },
                      { value: 'relaxed', label: 'খোলামেলা' },
                    ]}
                  />
                </div>
              </Group>

              <Group title="বিভাগের ক্রম ও দৃশ্যমানতা" icon={Layout}>
                <div className="space-y-1.5">
                  {settings.sectionOrder.map((id, idx) => {
                    const hidden = settings.hiddenSections?.includes(id);
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-all ${
                          hidden ? 'opacity-50 bg-slate-100' : 'shadow-sm'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">
                          {SECTION_META[id]?.label || id}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSection(id)}
                          title={hidden ? 'দেখান' : 'লুকান'}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-indigo-600" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(id, -1)}
                          disabled={idx === 0}
                          title="উপরে নিন"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(id, 1)}
                          disabled={idx === settings.sectionOrder.length - 1}
                          title="নিচে নিন"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Group>
            </>
          )}

          {/* TAB 2: TYPOGRAPHY & COLUMNS */}
          {activeTab === 'typography' && (
            <>
              <Group title="বাংলা ফন্ট ও সাইজ" icon={Type}>
                <div className="space-y-2">
                  <select
                    value={settings.fontId}
                    onChange={(e) => set({ fontId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                  <div className="rounded-xl bg-white p-2.5 border border-slate-200 space-y-1">
                    <NumberRow
                      label="ফন্ট সাইজ"
                      value={settings.fontSize}
                      min={10}
                      max={20}
                      step={0.5}
                      suffix="px"
                      onChange={(n) => set({ fontSize: n })}
                    />
                    <NumberRow
                      label="লাইন গ্যাপ"
                      value={settings.lineHeight}
                      min={1.1}
                      max={2.0}
                      step={0.05}
                      onChange={(n) => set({ lineHeight: n })}
                    />
                  </div>
                </div>
              </Group>

              <Group title="কলাম বিন্যাস (Columns)" icon={Layout}>
                <div className="space-y-2.5">
                  {[
                    ['mcqColumns', 'বহুনির্বাচনী প্রশ্ন (MCQ)'],
                    ['cqColumns', 'সৃজনশীল প্রশ্ন (CQ)'],
                    ['kkhColumns', 'জ্ঞান ও অনুধাবনমূলক প্রশ্ন'],
                  ].map(([key, label]) => (
                    <div key={key} className="rounded-xl bg-white p-2 border border-slate-200">
                      <p className="mb-1.5 text-xs font-bold text-slate-700">{label}</p>
                      <Segmented
                        value={settings[key]}
                        onChange={(v) => set({ [key]: v })}
                        options={[
                          { value: 1, label: '১ কলাম' },
                          { value: 2, label: '২ কলাম' },
                          { value: 3, label: '৩ কলাম' },
                        ]}
                      />
                    </div>
                  ))}
                </div>
              </Group>

              <Group title="MCQ অপশনের লেআউট ও স্টাইল" icon={HelpCircle}>
                <div className="space-y-2.5">
                  <div>
                    <p className="mb-1 text-xs font-bold text-slate-700">অপশন কলাম সংখ্যা:</p>
                    <Segmented
                      value={settings.mcqOptionLayout || 'auto'}
                      onChange={(v) => set({ mcqOptionLayout: v })}
                      options={[
                        { value: 'auto', label: 'অটো' },
                        { value: '4col', label: '৪ কলাম (১ লাইন)' },
                        { value: '2col', label: '২ কলাম (২×২)' },
                        { value: '1col', label: '১ কলাম (লম্বা)' },
                      ]}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold text-slate-700">অপশন লেবেল ধরন:</p>
                    <Segmented
                      value={settings.mcqOptionLabelType || 'bn'}
                      onChange={(v) => set({ mcqOptionLabelType: v })}
                      options={[
                        { value: 'bn', label: 'ক, খ, গ, ঘ' },
                        { value: 'en', label: 'A, B, C, D' },
                        { value: 'roman', label: 'i, ii, iii, iv' },
                      ]}
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold text-slate-700">চিহ্নের স্টাইল:</p>
                    <Segmented
                      value={settings.mcqOptionBulletStyle || 'circle'}
                      onChange={(v) => set({ mcqOptionBulletStyle: v })}
                      options={[
                        { value: 'circle', label: 'বৃত্ত ⓐ' },
                        { value: 'bracket', label: 'ব্র্যাকেট (ক)' },
                        { value: 'dot', label: 'ডট ক.' },
                      ]}
                    />
                  </div>
                </div>
              </Group>
            </>
          )}

          {/* TAB 4: HEADER & STUDENT INFO */}
          {activeTab === 'elements' && (
            <>
              <Group title="হেডার বর্ডার স্টাইল" icon={Layout}>
                <Segmented
                  value={settings.headerBorderStyle || 'double'}
                  onChange={(v) => set({ headerBorderStyle: v })}
                  options={[
                    { value: 'double', label: 'ডাবল লাইন' },
                    { value: 'single', label: 'একক লাইন' },
                    { value: 'boxed', label: 'বক্সড হেডার' },
                    { value: 'none', label: 'বর্ডারহীন' },
                  ]}
                />
              </Group>

              <Group title="শিক্ষার্থীর তথ্য বক্স (পরীক্ষার্থীদের জন্য)" icon={UserCheck}>
                <div className="space-y-2">
                  <Toggle
                    label="নাম ও রোল বক্স দেখান"
                    description="প্রশ্নপত্রে পরীক্ষার্থীর নাম, রোল, শাখা লেখার জায়গা"
                    checked={settings.showStudentInfo}
                    onChange={(v) => set({ showStudentInfo: v })}
                  />
                  {settings.showStudentInfo && (
                    <div className="pt-2">
                      <p className="mb-1 text-xs font-bold text-slate-700">বক্সের স্টাইল:</p>
                      <Segmented
                        value={settings.studentInfoStyle || 'line'}
                        onChange={(v) => set({ studentInfoStyle: v })}
                        options={[
                          { value: 'line', label: 'এক লাইনে ডট' },
                          { value: 'box', label: 'টেবিল বক্স' },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </Group>

              <Group title="বিশেষ নির্দেশনা (Instructions)" icon={Sparkles}>
                <div className="space-y-2">
                  <textarea
                    value={settings.instructions}
                    onChange={(e) => set({ instructions: e.target.value })}
                    rows={2}
                    placeholder="যেমন: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।"
                    className="w-full resize-y rounded-xl border border-slate-300 p-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {INSTRUCTION_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => set({ instructions: p })}
                        className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        + {p.slice(0, 22)}...
                      </button>
                    ))}
                  </div>
                </div>
              </Group>

              <Group title="অন্যান্য অপশন" icon={Settings2}>
                <div className="space-y-1">
                  <Toggle
                    label="প্রশ্নের পূর্ণমান দেখান"
                    checked={settings.showMarks}
                    onChange={(v) => set({ showMarks: v })}
                  />
                  <Toggle
                    label="বিভাগের হিসাব (৫ × ১০ = ৫০)"
                    checked={settings.showSectionNote}
                    onChange={(v) => set({ showSectionNote: v })}
                  />
                  <Toggle
                    label="পৃষ্ঠা নম্বর (Page Number)"
                    checked={settings.showPageNumber}
                    onChange={(v) => set({ showPageNumber: v })}
                  />
                  <NumberRow
                    label="সৃজনশীলের ফাঁকা রেখা"
                    value={settings.showAnswerLines}
                    min={0}
                    max={8}
                    onChange={(n) => set({ showAnswerLines: n })}
                  />
                </div>
              </Group>
            </>
          )}

          {/* TAB 5: WATERMARK & FOOTER */}
          {activeTab === 'watermark' && (
            <>
              <Group title="জলছাপ / Watermark" icon={Stamp}>
                <div className="space-y-2.5">
                  <Toggle
                    label="জলছাপ যুক্ত করুন"
                    description="পৃষ্ঠার ব্যাকগ্রাউন্ডে প্রতিষ্ঠানের নাম বা টেক্সট"
                    checked={settings.showWatermark}
                    onChange={(v) => set({ showWatermark: v })}
                  />
                  {settings.showWatermark && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={settings.watermarkText}
                        onChange={(e) => set({ watermarkText: e.target.value })}
                        placeholder="জলছাপের লেখা (যেমন: প্রতিষ্ঠানের নাম)"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                      />
                      <NumberRow
                        label="দৃশ্যমানতা (অস্বচ্ছতা)"
                        value={settings.watermarkOpacity || 12}
                        min={5}
                        max={30}
                        suffix="%"
                        onChange={(n) => set({ watermarkOpacity: n })}
                      />
                    </div>
                  )}
                </div>
              </Group>

              <Group title="ফুটার ও সমাপনী বার্তা" icon={Sparkles}>
                <div className="space-y-2.5">
                  <Toggle
                    label="সমাপনী বার্তা দেখান"
                    description="প্রশ্নপত্রের একদম নিচে সমাপ্তি বা শুভেচ্ছাবার্তা"
                    checked={settings.showFooter}
                    onChange={(v) => set({ showFooter: v })}
                  />
                  {settings.showFooter && (
                    <input
                      type="text"
                      value={settings.footerText}
                      onChange={(e) => set({ footerText: e.target.value })}
                      placeholder="যেমন: — সমাপ্ত — বা — শুভকামনা —"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </div>
              </Group>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
          >
            প্রয়োগ করুন ও বন্ধ করুন
          </button>
        </div>
      </aside>
    </div>
  );
});

PrintSettingsPanel.displayName = 'PrintSettingsPanel';

export { DEFAULT_PRINT_SETTINGS };
export default PrintSettingsPanel;
