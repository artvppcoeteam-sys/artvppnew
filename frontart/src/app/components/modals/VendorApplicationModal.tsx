import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Mail, Phone, Briefcase, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface VendorApplicationModalProps {
  open: boolean;
  onClose: () => void;
  application: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function VendorApplicationModal({
  open,
  onClose,
  application,
  onApprove,
  onReject
}: VendorApplicationModalProps) {
  if (!application) return null;

  const handleApprove = () => {
    onApprove?.(application.id);
    toast.success(`Approved ${application.name}'s application`);
    onClose();
  };

  const handleReject = () => {
    onReject?.(application.id);
    toast.error(`Rejected ${application.name}'s application`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vendor Application Review</DialogTitle>
          <DialogDescription>
            Review the artist's application to join Artvpp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Applicant Info */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={application.avatar} alt={application.name} />
              <AvatarFallback>{application.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{application.name}</h3>
              <p className="text-gray-600">{application.specialty}</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                {application.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{application.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{application.phone}</span>
              </div>
              {application.portfolio && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <a
                    href={application.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a73f2b] hover:underline"
                  >
                    {application.portfolio}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Professional Details */}
          <div>
            <h4 className="font-semibold mb-3">Professional Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Specialty</p>
                <p className="font-medium">{application.specialty}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Experience</p>
                <p className="font-medium">{application.experience}</p>
              </div>
            </div>
          </div>

          {/* Artist Statement */}
          {application.statement && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Artist Statement</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed">
                  {application.statement}
                </p>
              </div>
            </>
          )}

          {/* Application Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Applied on {application.applicationDate}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            Reject Application
          </Button>
          <Button
            onClick={handleApprove}
            className="flex-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white"
          >
            Approve & Onboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
