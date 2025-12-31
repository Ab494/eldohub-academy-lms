import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/AuthContext';
import { certificateAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  issuedDate: string;
  certificateUrl?: string;
}

const StudentCertificates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const certificatesResponse = await certificateAPI.getMyCertificates();
      if (certificatesResponse.success) {
        setCertificates(certificatesResponse.data.certificates || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    if (certificate.certificateUrl) {
      window.open(certificate.certificateUrl, '_blank');
    } else {
      toast({
        title: 'Download Unavailable',
        description: 'Certificate download link is not available yet',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Certificates
        </h1>
        <p className="text-muted-foreground mt-1">
          Your completed course certificates and achievements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Award className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{certificates.length}</div>
          <div className="text-sm text-muted-foreground">Certificates Earned</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {certificates.length > 0 ? new Date(certificates[0]?.issuedDate).getFullYear() : 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">Latest Certificate</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete courses to earn certificates. Keep learning to unlock your achievements!
          </p>
          <Button variant="hero">
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div key={certificate._id} className="bg-card rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Certificate of Completion</h3>
                  <p className="text-sm text-muted-foreground">{certificate.course.title}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Issued {new Date(certificate.issuedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  Awarded to {user?.firstName} {user?.lastName}
                </div>
              </div>

              <Button
                onClick={() => handleDownload(certificate)}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;