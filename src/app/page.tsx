"use client";

import React, { useState, useMemo } from 'react';
import { Users, UserCheck, AlertCircle, Info, ChevronDown, Save, CheckCircle, FileText, BookOpen, GraduationCap, Trash2 } from 'lucide-react';

// Configuration Limits
const MAX_SET = 18;
const MAX_ADVISER = 5;
const MAX_CHAIR = 8;

// Data extracted from the provided table
const panelData = {
  A: {
    chairs: ["NEIL MARK Z. BACASONG, MIT", "ROMAN JADE SALOMON, MIT"],
    members: ["BELYN R. ENGUERRA, MEngg.Ed, Ph.D", "LOBELLA DP CALAGO, MAEd"],
    secretary: "REGINA CABILES, MST"
  },
  B: {
    chairs: ["FERDINAND V. ANDRADE, MIT", "MINAH P. QUIÑAL, MIT, Ph.D."],
    members: ["RODEL R. MARQUEZ, MBA, JD.", "ALDELIENE K. TULAWIE, MEngg.Ed."],
    secretary: "FLORINDA ANGELES, MAED"
  },
  C: {
    chairs: ["ADRIAN B. MARTIN, MIT, Ph.D.", "PATERNO TAGAPAN, MIT"],
    members: ["Engr. ENGARD L. CORONEL, MATVE", "JANELEE C. PASTOR, MLS"],
    secretary: "IRISH FAYE BENGUIL, MAED (CAR)"
  }
};

export default function App() {
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedAdviser, setSelectedAdviser] = useState('');
  const [selectedChair, setSelectedChair] = useState('');
  const [titleProposal, setTitleProposal] = useState('');
  const [students, setStudents] = useState(['', '', '', '']);
  const [savedPanels, setSavedPanels] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Helper functions to track limit usages
  const getSetCount = (setName) => savedPanels.filter(p => p.set === setName).length;
  const getAdviserCount = (name) => savedPanels.filter(p => p.adviser === name).length;
  const getChairCount = (name) => savedPanels.filter(p => p.panel.chairman === name).length;

  const handleStudentChange = (index, value) => {
    const newStudents = [...students];
    newStudents[index] = value;
    setStudents(newStudents);
  };

  // Get all available faculty for the selected set to populate the Adviser dropdown
  const availableFaculty = useMemo(() => {
    if (!selectedSet) return [];
    const set = panelData[selectedSet];
    return [...set.chairs, ...set.members];
  }, [selectedSet]);

  // Handle Set Change (reset adviser and chair)
  const handleSetChange = (e) => {
    setSelectedSet(e.target.value);
    setSelectedAdviser('');
    setSelectedChair('');
  };

  // Handle Adviser Change
  const handleAdviserChange = (e) => {
    const newAdviser = e.target.value;
    setSelectedAdviser(newAdviser);
    // If the currently selected chair was chosen as the new adviser, reset the chair
    if (selectedChair === newAdviser) {
      setSelectedChair('');
    }
  };

  // Get available chairs based on set and chosen adviser
  const availableChairs = useMemo(() => {
    if (!selectedSet) return [];
    const set = panelData[selectedSet];
    return set.chairs.filter(chair => chair !== selectedAdviser);
  }, [selectedSet, selectedAdviser]);

  // Compute final panel assignments based on rules
  const finalPanel = useMemo(() => {
    if (!selectedSet || !selectedAdviser || !selectedChair) return null;

    const set = panelData[selectedSet];

    // Collect everyone in the set
    const allSetFaculty = [...set.chairs, ...set.members];

    // Remove the adviser and the chosen chairman to get the final members
    const finalMembers = allSetFaculty.filter(
      person => person !== selectedAdviser && person !== selectedChair
    );

    return {
      chairman: selectedChair,
      members: finalMembers,
      secretary: set.secretary
    };
  }, [selectedSet, selectedAdviser, selectedChair]);

  // Check if current selection violates limits
  const limitErrors = [];
  if (selectedSet && getSetCount(selectedSet) >= MAX_SET) limitErrors.push(`Set ${selectedSet} limit reached (${MAX_SET} max).`);
  if (selectedAdviser && getAdviserCount(selectedAdviser) >= MAX_ADVISER) limitErrors.push(`Adviser limit reached for ${selectedAdviser} (${MAX_ADVISER} max).`);
  if (selectedChair && getChairCount(selectedChair) >= MAX_CHAIR) limitErrors.push(`Chairman limit reached for ${selectedChair} (${MAX_CHAIR} max).`);

  const hasStudents = students.some(s => s.trim() !== '');
  const isFormValid = finalPanel && limitErrors.length === 0 && titleProposal.trim() !== '' && hasStudents;

  const handleSave = () => {
    if (!isFormValid) return;

    setSavedPanels(prev => [...prev, {
      id: Date.now(),
      title: titleProposal,
      students: students.filter(s => s.trim() !== ''),
      set: selectedSet,
      adviser: selectedAdviser,
      panel: finalPanel
    }]);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Reset form for new data
    setSelectedSet('');
    setSelectedAdviser('');
    setSelectedChair('');
    setTitleProposal('');
    setStudents(['', '', '', '']);
  };

  const handleDelete = (id) => {
    setSavedPanels(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Header */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Technical Panel Committees</h1>
            <p className="text-slate-500 mt-1">Select a set and an adviser to auto-generate the defense panel.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Controls Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-5 flex items-center border-b pb-3">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Configuration
              </h2>

              <div className="space-y-5">
                {/* Title Proposal */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Title Proposal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter research/project title..."
                    value={titleProposal}
                    onChange={(e) => setTitleProposal(e.target.value)}
                  />
                </div>

                {/* Students */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Student Names <span className="text-red-500">*</span></label>
                  <div className="space-y-3">
                    {students.map((student, idx) => (
                      <input
                        key={idx}
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder={`Student ${idx + 1}`}
                        value={student}
                        onChange={(e) => handleStudentChange(idx, e.target.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Set Selection */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Select Committee Set</label>
                  <div className="relative">
                    <select
                      className="w-full p-3 pr-10 appearance-none bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                      value={selectedSet}
                      onChange={handleSetChange}
                    >
                      <option value="">-- Choose a Set --</option>
                      <option value="A" disabled={getSetCount("A") >= MAX_SET}>Set A ({getSetCount("A")}/{MAX_SET})</option>
                      <option value="B" disabled={getSetCount("B") >= MAX_SET}>Set B ({getSetCount("B")}/{MAX_SET})</option>
                      <option value="C" disabled={getSetCount("C") >= MAX_SET}>Set C ({getSetCount("C")}/{MAX_SET})</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Adviser Selection */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Select Adviser</label>
                  <div className="relative">
                    <select
                      className="w-full p-3 pr-10 appearance-none bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      value={selectedAdviser}
                      onChange={handleAdviserChange}
                      disabled={!selectedSet}
                    >
                      <option value="">-- Choose an Adviser --</option>
                      {availableFaculty.map((faculty, idx) => {
                        const count = getAdviserCount(faculty);
                        const isFull = count >= MAX_ADVISER;
                        return (
                          <option key={idx} value={faculty} disabled={isFull}>
                            {faculty} ({count}/{MAX_ADVISER})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  {!selectedSet && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center">
                      <Info size={14} className="mr-1" /> Select a set first to see available faculty.
                    </p>
                  )}
                </div>

                {/* Chair Selection */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Select Chairman</label>
                  <div className="relative">
                    <select
                      className="w-full p-3 pr-10 appearance-none bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      value={selectedChair}
                      onChange={(e) => setSelectedChair(e.target.value)}
                      disabled={!selectedSet || !selectedAdviser}
                    >
                      <option value="">-- Choose a Chairman --</option>
                      {availableChairs.map((chair, idx) => {
                        const count = getChairCount(chair);
                        const isFull = count >= MAX_CHAIR;
                        return (
                          <option key={idx} value={chair} disabled={isFull}>
                            {chair} ({count}/{MAX_CHAIR})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  {selectedSet && selectedAdviser && availableChairs.length === 1 && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center">
                      <Info size={14} className="mr-1" /> Only one eligible chairman remains.
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            {finalPanel ? (
              <div className="bg-white rounded-2xl shadow-md border border-blue-200 overflow-hidden h-full flex flex-col">
                <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <UserCheck className="mr-2" size={24} />
                    Final Panel Composition
                  </h2>
                  <span className="bg-blue-800 text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                    Set {selectedSet}
                  </span>
                </div>

                <div className="p-6 sm:p-8 flex-grow space-y-6 bg-blue-50/30">

                  {/* Chairman */}
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <span className="text-xs font-bold tracking-wider uppercase text-blue-500 block mb-1">Chairman</span>
                    <span className="text-lg font-semibold text-slate-800">{finalPanel.chairman}</span>
                  </div>

                  {/* Panel Members */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400"></div>
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-2">Panel Members</span>
                    <ul className="space-y-2">
                      {finalPanel.members.map((member, idx) => (
                        <li key={idx} className="text-md text-slate-800 flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0"></span>
                          {member}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Secretary */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-1">Secretary</span>
                    <span className="text-md text-slate-700">{finalPanel.secretary}</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-slate-500 flex items-start max-w-sm">
                      <Info className="mr-2 mt-0.5 flex-shrink-0 text-slate-400" size={16} />
                      <span>
                        Adviser <strong>{selectedAdviser}</strong> is excluded from panel roles.
                      </span>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={!isFormValid}
                      className={`w-full sm:w-auto text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${!isFormValid ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                    >
                      <Save size={18} className="mr-2" />
                      Save Panel
                    </button>
                  </div>

                  {/* Validation Error Alerts */}
                  {limitErrors.length > 0 && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex flex-col gap-1 w-full mt-2">
                      {limitErrors.map((err, i) => (
                        <span key={i} className="flex items-center">
                          <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                          {err}
                        </span>
                      ))}
                    </div>
                  )}
                  {(!titleProposal.trim() || !hasStudents) && finalPanel && limitErrors.length === 0 && (
                    <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm flex items-start w-full mt-2">
                      <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>Please enter a Title Proposal and at least one Student Name to save.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Users size={48} className="mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-600 mb-2">No Panel Assigned Yet</p>
                <p className="max-w-xs">Please select a Set, an Adviser, and a Chairman to view the generated panel.</p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Panels List / Modern Landscape Report - Now Full Width */}
        {savedPanels.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <FileText className="mr-2 text-blue-600" size={24} />
                  Generated Panel Reports
                </h3>
                <p className="text-sm text-slate-500 mt-1">A comprehensive log of all assigned technical panels.</p>
              </div>
              <span className="bg-blue-100 text-blue-800 py-1.5 px-4 rounded-full text-sm font-bold shadow-sm">
                {savedPanels.length} {savedPanels.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            <div className="p-6 bg-slate-50/50 space-y-6">
              {savedPanels.map((record) => (
                <div key={record.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col lg:flex-row">

                  {/* Report Header: Title & Students (Left column on large screens) */}
                  <div className="p-5 border-b lg:border-b-0 lg:border-r border-slate-100 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start">
                        <h4 className="text-lg font-bold text-slate-900 flex items-start leading-snug">
                          <BookOpen size={20} className="mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                          {record.title}
                        </h4>
                        <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ml-4 whitespace-nowrap">
                          Set {record.set}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Panel"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-start text-sm text-slate-600 mt-1">
                      <GraduationCap size={18} className="mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-2">
                        {record.students.map((s, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 text-xs font-medium shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Report Body: Panel Roles (Middle column on large screens) */}
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 flex-[1.5] content-center">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[4.5rem]">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Chairman</span>
                      <span className="font-semibold text-slate-800 text-sm leading-tight">{record.panel.chairman}</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[4.5rem]">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Adviser</span>
                      <span className="font-semibold text-slate-800 text-sm leading-tight">{record.adviser}</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[4.5rem]">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Secretary</span>
                      <span className="font-semibold text-slate-800 text-sm leading-tight">{record.panel.secretary}</span>
                    </div>
                  </div>

                  {/* Report Footer: Panel Members (Right column on large screens) */}
                  <div className="p-5 bg-white border-t lg:border-t-0 lg:border-l border-slate-100 flex-1 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">Panel Members</span>
                    <div className="flex flex-col gap-2">
                      {record.panel.members.map((m, i) => (
                        <div key={i} className="flex items-center text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <UserCheck size={16} className="mr-2 text-slate-400 flex-shrink-0" />
                          <span className="font-medium leading-tight">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center animate-in slide-in-from-bottom-5">
          <CheckCircle className="text-green-400 mr-3" size={20} />
          <span className="font-medium">Panel configuration saved!</span>
        </div>
      )}
    </div>
  );
}
