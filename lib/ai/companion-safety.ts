export type CompanionSafetyResult = {
  blocked: boolean;

  response?: string;
};

export function checkCompanionSafety(
  message: string
): CompanionSafetyResult {
  const text =
    message
      .trim()
      .toLowerCase();

  // =====================================================
  // EMERGENCY / URGENT HEALTH LANGUAGE
  // =====================================================

  const emergencyTerms = [
    "chest pain",
    "can't breathe",
    "cannot breathe",
    "difficulty breathing",
    "unconscious",
    "severe bleeding",
    "overdose",
    "seizure",
    "suicide",
    "kill myself",
  ];

  const emergency =
    emergencyTerms.some(
      (term) =>
        text.includes(term)
    );

  if (emergency) {
    return {
      blocked: true,

      response:
        "This may require urgent medical attention. MediMate is not an emergency service. Please contact local emergency services or seek immediate help from a qualified healthcare professional. If possible, ask someone nearby to assist you.",
    };
  }

  // =====================================================
  // DOSAGE / TREATMENT DECISIONS
  // =====================================================

  const unsafePatterns = [
    "double dose",
    "double my dose",
    "increase dose",
    "decrease dose",
    "change dose",
    "change dosage",
    "stop taking",
    "should i stop",
    "should i take it now",
    "should i take now",
    "take two",
    "take extra",
    "skip my medicine",
    "skip the dose",
    "replace my medicine",
    "which medicine should i take",
    "what medicine should i take",
  ];

  const unsafe =
    unsafePatterns.some(
      (pattern) =>
        text.includes(pattern)
    );

  if (unsafe) {
    return {
      blocked: true,

      response:
        "I can help you review your medication schedule and adherence records, but I can't decide whether you should take, skip, stop, replace, increase, or decrease a medication. Please follow your prescription or medication-label instructions, or contact your doctor or pharmacist if you're unsure.",
    };
  }

  return {
    blocked: false,
  };
}