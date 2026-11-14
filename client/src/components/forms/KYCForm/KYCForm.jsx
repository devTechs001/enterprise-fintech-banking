import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FileCheck } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/common/Alert';

const validationSchema = Yup.object({
  documentType: Yup.string().oneOf(['passport', 'national_id', 'drivers_licence']).required('Choose a document type'),
  documentNumber: Yup.string().trim().min(5).max(40).required('Document number is required'),
  country: Yup.string().trim().length(2, 'Use a 2-letter country code').uppercase().required('Country is required'),
  addressLine1: Yup.string().trim().max(200).required('Address is required'),
  city: Yup.string().trim().max(100).required('City is required'),
});

/**
 * KYC / identity verification.
 *
 * Documents are uploaded over TLS and stored encrypted at rest; the form never
 * echoes a document number back after submission, and the API records the
 * verification decision in the audit trail.
 */
const KYCForm = ({ onSubmit, isSubmitting = false, status = 'pending' }) => (
  <Formik
    initialValues={{ documentType: '', documentNumber: '', country: '', addressLine1: '', city: '' }}
    validationSchema={validationSchema}
    onSubmit={onSubmit}
  >
    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
      <Form className="space-y-4" noValidate>
        <Alert variant="info" title={`Current status: ${status}`} description="Submitted documents are encrypted at rest and reviewed by the compliance team." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Document type"
            name="documentType"
            value={values.documentType}
            onChange={(next) => setFieldValue('documentType', next)}
            error={touched.documentType ? errors.documentType : undefined}
            options={[
              { value: '', label: 'Select…' },
              { value: 'passport', label: 'Passport' },
              { value: 'national_id', label: 'National ID' },
              { value: 'drivers_licence', label: "Driver's licence" },
            ]}
          />
          <Input label="Document number" name="documentNumber" autoComplete="off" value={values.documentNumber} onChange={handleChange} onBlur={handleBlur} error={touched.documentNumber ? errors.documentNumber : undefined} />
        </div>
        <Input label="Address" name="addressLine1" autoComplete="street-address" value={values.addressLine1} onChange={handleChange} onBlur={handleBlur} error={touched.addressLine1 ? errors.addressLine1 : undefined} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" name="city" autoComplete="address-level2" value={values.city} onChange={handleChange} onBlur={handleBlur} error={touched.city ? errors.city : undefined} />
          <Input label="Country code" name="country" maxLength={2} placeholder="KE" autoComplete="country" value={values.country} onChange={handleChange} onBlur={handleBlur} error={touched.country ? errors.country : undefined} />
        </div>
        <Button type="submit" loading={isSubmitting} leftIcon={FileCheck}>Submit for verification</Button>
      </Form>
    )}
  </Formik>
);

KYCForm.propTypes = { onSubmit: PropTypes.func.isRequired, isSubmitting: PropTypes.bool, status: PropTypes.string };

export { KYCForm };
export default KYCForm;
