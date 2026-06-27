import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import WhyPIR from "@/pages/WhyPIR";
import Booking from "@/pages/Booking";
import Admissions from "@/pages/Admissions";
import Admin from "@/pages/Admin";
import Student from "@/pages/Student";
import NotFound from "@/pages/NotFound";
import StudentsPage from "@/pages/admin/Students";
import CRMPage from "@/pages/admin/CRM";
import CommsPage from "@/pages/admin/Comms";
import CalendarPage from "@/pages/admin/Calendar";
import GroundTracker from "@/pages/admin/GroundTracker";
import AttendancePage from "@/pages/admin/Attendance";
import ScanPage from "@/pages/coach/Scan";
import CoachPortal from "@/pages/coach/Portal";
import ParentPortal from "@/pages/parent/Portal";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/why-pir" component={WhyPIR} />
        <Route path="/booking" component={Booking} />
        <Route path="/admissions" component={Admissions} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/students" component={StudentsPage} />
        <Route path="/admin/crm" component={CRMPage} />
        <Route path="/admin/comms" component={CommsPage} />
        <Route path="/admin/attendance" component={AttendancePage} />
        <Route path="/admin/calendar" component={CalendarPage} />
        <Route path="/admin/ground-tracker" component={GroundTracker} />
        <Route path="/coach" component={CoachPortal} />
        <Route path="/coach/scan" component={ScanPage} />
        <Route path="/parent" component={ParentPortal} />
        <Route path="/student" component={Student} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}
