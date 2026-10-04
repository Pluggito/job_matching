"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "../../../actions/auth";
import { saveOnboardingData } from "../../../actions/onboarding";
import { 
  BriefcaseBusiness, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Building2, 
  MapPin,
  Phone,
  Banknote,
  Users,
  Scissors,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function StepIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div 
            className={`w-10 h-2 rounded-full transition-all duration-500 ${
              i + 1 === currentStep 
                ? "bg-[var(--green)] w-16" 
                : i + 1 < currentStep 
                  ? "bg-[var(--green)]/40" 
                  : "bg-[var(--line)]"
            }`} 
          />
        </div>
      ))}
    </div>
  );
}

function EmployerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    location: "",
    staffType: "",
    contractType: "Permanent",
    compensationType: "Salary",
    amount: "",
    hasAccommodation: "No"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await saveOnboardingData("EMPLOYER", formData);
      if (res.success) {
        router.push("/jobs/search");
      } else {
        alert("Failed to save profile. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="[font-family:var(--font-space-grotesk)] text-3xl font-bold text-[var(--ink)] tracking-tight">Complete your profile</h1>
        <p className="mt-2 text-muted-foreground">Let's get your business set up on Staff Guru.</p>
      </div>

      <StepIndicator currentStep={step} totalSteps={2} />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-[var(--line)] shadow-sm shadow-black/5 relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--line)] pb-4">
              <User className="text-[var(--green)]" /> Personal & Business Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Adebayo Adewale" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Business Name</label>
                <input type="text" name="businessName" required value={formData.businessName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Thread & Form" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="+234..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Location</label>
                <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Surulere, Lagos" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--line)] pb-4">
              <BriefcaseBusiness className="text-[var(--green)]" /> Hiring Requirements
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Type of staff needed</label>
                <input type="text" name="staffType" required value={formData.staffType} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Master Tailor, Waitress, Electrician" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Contract Type</label>
                  <select name="contractType" value={formData.contractType} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                    <option>Permanent</option>
                    <option>Temporary / Contract</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Accommodation</label>
                  <select name="hasAccommodation" value={formData.hasAccommodation} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                    <option>No</option>
                    <option>Yes (Provided)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--line)]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Compensation</label>
                  <select name="compensationType" value={formData.compensationType} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                    <option>Salary</option>
                    <option>Commission</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Amount (₦)</label>
                  <input type="text" name="amount" required value={formData.amount} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. 150,000 / month" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-[var(--line)]">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors px-4 py-2">
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div></div>}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="h-12 px-8 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : step === 2 ? (
              <><Check size={16} /> Complete Setup</>
            ) : (
              <>Next Step <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function WorkerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTailor, setIsTailor] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "", age: "", gender: "Male", phone: "", address: "", 
    jobType: "", experience: "", compensation: "Salary", amount: "", accommodation: "No",
    empName: "", empPhone: "", empRole: "", empDuration: "", empStart: "", empEnd: "", empReason: "",
    tailorMachine: "No", tailorPattern: "Freehand", tailorCorset: "No",
    g1Name: "", g1Phone: "", g1Occ: "", g1Address: "",
    g2Name: "", g2Phone: "", g2Occ: "", g2Address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Automatically trigger tailor form
    if (name === "jobType") {
      setIsTailor(value.toLowerCase().includes("tailor") || value.toLowerCase().includes("fashion") || value.toLowerCase().includes("sew") || value.toLowerCase().includes("pattern"));
    }
  };

  const totalSteps = isTailor ? 4 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await saveOnboardingData("WORKER", formData);
      if (res.success) {
        router.push("/jobs/search");
      } else {
        alert("Failed to save profile. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="[font-family:var(--font-space-grotesk)] text-3xl font-bold text-[var(--ink)] tracking-tight">Create your Worker Profile</h1>
        <p className="mt-2 text-muted-foreground">Let's get you verified and ready for work.</p>
      </div>

      <StepIndicator currentStep={step} totalSteps={totalSteps} />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-[var(--line)] shadow-sm shadow-black/5 relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--line)] pb-4">
              <User className="text-[var(--green)]" /> Personal Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Full Name</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Adebayo Adewale" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Age</label>
                <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. 28" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="+234..." />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Residential Address</label>
                <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Full address" />
              </div>
              
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)] text-[var(--green)]">Type of Job Needed</label>
                <input type="text" name="jobType" required value={formData.jobType} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--green)] bg-[var(--green)]/5 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)] transition-all placeholder:text-[var(--green)]/50" placeholder="e.g. Master Tailor" />
                <p className="text-[10px] text-muted-foreground">Note: If you enter Tailor or Fashion, you will be assessed.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--line)] mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Experience (Yrs)</label>
                <input type="number" name="experience" required value={formData.experience} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. 5" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Expectation</label>
                <select name="compensation" value={formData.compensation} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                  <option>Salary</option>
                  <option>Commission</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Amount (₦)</label>
                <input type="text" name="amount" required value={formData.amount} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. 150,000" />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Do you need accommodation?</label>
                <select name="accommodation" value={formData.accommodation} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--line)] pb-4">
              <Building2 className="text-[var(--green)]" /> Previous Employment History
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Name of Employer / Business</label>
                <input type="text" name="empName" required value={formData.empName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Zenith Fashion" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Employer Phone</label>
                <input type="tel" name="empPhone" required value={formData.empPhone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="+234..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Job Role</label>
                <input type="text" name="empRole" required value={formData.empRole} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Pattern Maker" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Duration</label>
                <input type="text" name="empDuration" required value={formData.empDuration} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. 2 years" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Start & End Dates</label>
                <div className="flex gap-2">
                  <input type="month" name="empStart" required value={formData.empStart} onChange={handleChange} className="w-1/2 h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" />
                  <input type="month" name="empEnd" required value={formData.empEnd} onChange={handleChange} className="w-1/2 h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Reason for leaving</label>
                <input type="text" name="empReason" required value={formData.empReason} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="e.g. Needed better pay, relocated" />
              </div>
            </div>
          </div>
        )}

        {isTailor && step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--line)] pb-4">
              <Scissors className="text-[var(--green)]" /> Tailoring Assessment
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Can you use industrial sewing & weaving machines?</label>
                <select name="tailorMachine" value={formData.tailorMachine} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Can you draft standard patterns or freehand?</label>
                <select name="tailorPattern" value={formData.tailorPattern} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                  <option>Standard Patterns</option>
                  <option>Freehand</option>
                  <option>Both</option>
                  <option>Neither</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Can you make corsets?</label>
                <select name="tailorCorset" value={formData.tailorCorset} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all appearance-none">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[var(--line)]">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)] mb-2 block">Upload 3 Samples of your work</label>
                <div className="border-2 border-dashed border-[var(--line)] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-[var(--canvas)] transition-colors cursor-pointer group">
                  <ImageIcon size={32} className="text-muted-foreground group-hover:text-[var(--green)] transition-colors mb-3" />
                  <p className="text-sm font-bold text-[var(--ink)]">Click to upload images</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB each</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === totalSteps && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--line)] pb-4">
              <Users className="text-[var(--green)]" /> Guarantors Verification
            </h2>
            <p className="text-sm text-muted-foreground -mt-4">Please provide 2 reliable guarantors. They will be contacted for verification.</p>
            
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--line)] space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--lime)] flex items-center justify-center text-xs">1</div> First Guarantor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="g1Name" required value={formData.g1Name} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Full Name" />
                  <input type="tel" name="g1Phone" required value={formData.g1Phone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Phone Number" />
                  <input type="text" name="g1Occ" required value={formData.g1Occ} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Occupation" />
                  <input type="text" name="g1Address" required value={formData.g1Address} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Residential Address" />
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--line)] space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--lime)] flex items-center justify-center text-xs">2</div> Second Guarantor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="g2Name" required value={formData.g2Name} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Full Name" />
                  <input type="tel" name="g2Phone" required value={formData.g2Phone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Phone Number" />
                  <input type="text" name="g2Occ" required value={formData.g2Occ} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Occupation" />
                  <input type="text" name="g2Address" required value={formData.g2Address} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all" placeholder="Residential Address" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-[var(--line)]">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors px-4 py-2">
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div></div>}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="h-12 px-8 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying...</>
            ) : step === totalSteps ? (
              <><CheckCircle2 size={16} /> Submit Profile</>
            ) : (
              <>Next Step <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        setRole(user.role);
      } else {
        // Fallback or handle unauthenticated state
        window.location.href = "/login";
      }
    });
  }, []);

  if (!role) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--green)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] py-12 px-4 md:px-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--lime)] flex items-center justify-center font-bold text-lg text-[var(--ink)] shadow-sm transition-transform group-hover:scale-105">
              sg
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--ink)] [font-family:var(--font-space-grotesk)]">
              staff<span className="text-[var(--green)]">guru.</span>
            </span>
          </Link>
          
          <div className="px-4 py-1.5 rounded-full bg-[var(--canvas)] border border-[var(--line)] text-xs font-bold text-muted-foreground flex items-center gap-2">
            <ShieldCheck size={14} className="text-[var(--green)]" />
            Secure Onboarding
          </div>
        </div>

        {role === "EMPLOYER" ? <EmployerOnboarding /> : <WorkerOnboarding />}
        
      </div>
    </div>
  );
}
