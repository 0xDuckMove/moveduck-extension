import { BadgeCheck } from "lucide-react";
function Completed() {

    return ( <div style={{
        display: 'flex',
        alignItems: 'center',
    }}>
        <span style={{
            color: '#1d9bf0',
            fontWeight: '500',
            marginRight: '4px',
        }}>Moveduck action have been completed</span>
        <BadgeCheck strokeWidth={3}  size={16} stroke="#1d9bf0" />
    </div> );
}

export default Completed;