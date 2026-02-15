// src/calls/control/utils/ControlPermissions.js

import { CONTROL_IDS } from "../ControlPanelButtons.js";

export function canUseControl(member, controlId, session) {
    if (!member) return false;

    const isStaff = member.permissions.has("ManageGuild");

    if (controlId === CONTROL_IDS.END || controlId === CONTROL_IDS.REPORT) {
        return isStaff;
    }

    // Skip / Pause / Help: allow anyone in the guild for now
    return true;
}