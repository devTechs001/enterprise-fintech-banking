import { useState } from 'react';
import PropTypes from 'prop-types';
import { HelpCircle, ShieldX } from 'lucide-react';

import { Alert } from '@/components/common/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

const PRESET_QUESTIONS = [
  'What was the name of your first school?',
  'In which city were you born?',
  'What is the name of your first pet?',
  "What was your first job's employer?",
];

/**
 * Security questions — intentionally NOT an enrolment form.
 *
 * The original scaffold listed this as a security feature. Knowledge-based
 * questions are a weak authentication factor: answers are public-record or
 * social-media discoverable, they are not secret, and they cannot be rotated
 * after a breach. NIST SP 800-63B §5.2.1 explicitly prohibits memorised
 * secrets derived from such questions for identity proofing.
 *
 * This component therefore renders the recommendation rather than a form, so the
 * Security Centre cannot imply a control that should not exist.
 */
const SecurityQuestions = ({ questions = PRESET_QUESTIONS }) => (
  <Card>
    <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600 dark:bg-danger-500/10">
          <ShieldX className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Security questions</CardTitle>
          <CardDescription>Deliberately not offered as an authentication factor.</CardDescription>
        </div>
      </div>
      <Badge variant="danger">Deprecated</Badge>
    </CardHeader>
    <CardContent className="space-y-3">
      <Alert variant="warning" title="Knowledge-based questions are not used for account recovery">
        Answers are guessable from public records and social media, cannot be rotated after exposure, and
        are prohibited as a primary factor by NIST SP 800-63B. Recovery here uses a time-limited,
        single-use emailed link plus mandatory MFA re-enrolment.
      </Alert>
      <details className="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700">
        <summary className="flex cursor-pointer items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          What replaced them?
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-400">
          <li>Time-based one-time passwords (RFC 6238) for step-up authentication.</li>
          <li>Device trust with explicit, revocable user consent.</li>
          <li>Session listing and one-click revocation of all other sessions.</li>
          <li>An immutable audit trail of every security-relevant event.</li>
        </ul>
      </details>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Reference list kept for reviewers: {questions.length} candidate questions were evaluated and rejected.
      </p>
    </CardContent>
  </Card>
);

SecurityQuestions.propTypes = { questions: PropTypes.arrayOf(PropTypes.string) };

export { SecurityQuestions };
export default SecurityQuestions;
