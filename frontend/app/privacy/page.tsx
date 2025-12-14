import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Shield, Lock, Eye, FileText, Scale, Globe, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <Button variant="ghost" asChild className="mb-4 -ml-3">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mt-1">
                Last updated: December 13, 2025
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed">
              MediPredict ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered medical diagnosis prediction platform.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using MediPredict, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">1. Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Date of birth and gender</li>
                <li>Medical license information (for doctors)</li>
                <li>Profile photos and professional credentials</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">2. Health Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Symptoms and medical conditions reported</li>
                <li>AI prediction results and confidence scores</li>
                <li>Consultation records and medical history</li>
                <li>Prescriptions and treatment plans</li>
                <li>Appointment details and doctor-patient communications</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3">3. Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and features used</li>
                <li>Time and date of access</li>
                <li>Analytics and performance data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader className="bg-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <span>Provide and improve our AI prediction services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <span>Facilitate doctor-patient consultations and appointments</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <span>Train and improve our AI models (using anonymized data)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <span>Send appointment reminders and important notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <span>Comply with legal obligations and prevent fraud</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </span>
                <span>Analyze usage patterns to enhance user experience</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader className="bg-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-600" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your personal and health information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>End-to-end encryption for data transmission</li>
              <li>Encrypted storage of sensitive health information</li>
              <li>Regular security audits and penetration testing</li>
              <li>Secure access controls and authentication</li>
              <li>HIPAA-compliant data handling procedures</li>
              <li>Regular backups and disaster recovery plans</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <strong>Note:</strong> While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal or health information. We may share your information only in the following circumstances:
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">With Healthcare Providers</h4>
                <p className="text-gray-700 text-sm">
                  Your symptoms and AI predictions are shared with doctors you book appointments with to facilitate better consultations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Service Providers</h4>
                <p className="text-gray-700 text-sm">
                  We work with third-party service providers for hosting, analytics, and payment processing who are bound by confidentiality agreements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Legal Requirements</h4>
                <p className="text-gray-700 text-sm">
                  We may disclose information when required by law or to protect our rights and safety.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Research (Anonymized Data)</h4>
                <p className="text-gray-700 text-sm">
                  We may use anonymized and aggregated data for medical research and AI model improvement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span><strong>Access:</strong> Request a copy of your personal data we hold</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span><strong>Correction:</strong> Update or correct inaccurate information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span><strong>Deletion:</strong> Request deletion of your account and data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span><strong>Portability:</strong> Export your data in a portable format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span><strong>Opt-out:</strong> Unsubscribe from marketing communications</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-lg border-2 border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> privacy@medipred.com</p>
              <p><strong>Address:</strong> 123 Medical Plaza, Healthcare District, New York, NY 10001</p>
              <p><strong>Phone:</strong> 1-800-MEDI-PRED</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
