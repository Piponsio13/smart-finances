import { createTheme } from '@mui/material/styles';
import { concrete, moss, oxide } from './palette';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: concrete.void,
      contrastText: concrete.paper,
    },
    secondary: {
      main: concrete.aggregate,
      contrastText: concrete.void,
    },
    success: {
      main: moss.main,
      light: moss.light,
    },
    error: {
      main: oxide.main,
      light: oxide.light,
    },
    background: {
      default: concrete.bg,
      paper: concrete.paper,
    },
    text: {
      primary: concrete.void,
      secondary: concrete.aggregate,
    },
    divider: concrete.void,
  },
  typography: {
    fontFamily: '"Space Mono", "Courier New", monospace',
    h4: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 },
    h5: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 },
    h6: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
    subtitle1: { fontWeight: 700 },
    body2: { color: concrete.aggregate },
    caption: { color: concrete.aggregate },
    button: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1.5 },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: `6px 6px 0px ${concrete.void}`,
          border: `2px solid ${concrete.void}`,
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: 'none', borderRadius: 0 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          fontWeight: 700,
          letterSpacing: 1.5,
          transition: 'box-shadow 0.1s, transform 0.1s',
          '&:hover': {
            boxShadow: `4px 4px 0px ${concrete.void}`,
            transform: 'translate(-1px, -1px)',
          },
          '&:active': {
            boxShadow: 'none',
            transform: 'translate(2px, 2px)',
          },
        },
        contained: {
          backgroundColor: concrete.void,
          color: concrete.paper,
          border: `2px solid ${concrete.void}`,
          '&:hover': { backgroundColor: concrete.charcoal },
          '&.Mui-disabled': { backgroundColor: concrete.stone, color: concrete.aggregate, border: `2px solid ${concrete.stone}` },
        },
        outlined: {
          border: `2px solid ${concrete.void}`,
          color: concrete.void,
          '&:hover': { border: `2px solid ${concrete.void}`, backgroundColor: 'rgba(26,25,24,0.06)' },
        },
        text: {
          color: concrete.void,
          fontWeight: 700,
          '&:hover': { backgroundColor: 'rgba(26,25,24,0.06)', boxShadow: 'none', transform: 'none' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: '"Space Mono", "Courier New", monospace',
          backgroundColor: concrete.paper,
          '& fieldset': { borderColor: concrete.void, borderWidth: '2px' },
          '&:hover fieldset': { borderColor: `${concrete.void} !important`, borderWidth: '2px !important' },
          '&.Mui-focused fieldset': { borderColor: `${concrete.void} !important`, borderWidth: '2px !important' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontWeight: 700,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: concrete.void,
          '&.Mui-focused': { color: concrete.void },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontSize: 13,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontWeight: 700,
          border: `1.5px solid ${concrete.void}`,
          fontSize: 10,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          height: 22,
        },
        label: { padding: '0 8px' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontFamily: '"Space Mono", "Courier New", monospace',
            fontWeight: 700,
            color: concrete.paper,
            backgroundColor: concrete.void,
            borderBottom: `2px solid ${concrete.void}`,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: 11,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", "Courier New", monospace',
          borderColor: concrete.stone,
          fontSize: 13,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(26,25,24,0.05) !important' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          height: 10,
          backgroundColor: concrete.stone,
          border: `1px solid ${concrete.void}`,
        },
        bar: {
          borderRadius: 0,
          backgroundColor: concrete.void,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `3px solid ${concrete.void}`,
          boxShadow: `10px 10px 0px ${concrete.void}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          borderBottom: `2px solid ${concrete.void}`,
          backgroundColor: concrete.void,
          color: concrete.paper,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `2px solid ${concrete.void}`,
          padding: '16px',
          gap: '8px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '2px solid',
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontWeight: 700,
          fontSize: 12,
        },
        standardError: {
          borderColor: oxide.main,
          backgroundColor: oxide.light,
          color: oxide.main,
        },
        standardSuccess: {
          borderColor: moss.main,
          backgroundColor: moss.light,
          color: moss.main,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: concrete.void, borderWidth: 1 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 0, backgroundColor: 'rgba(26,25,24,0.08)' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: concrete.void,
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontSize: 11,
          border: `1px solid ${concrete.void}`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid transparent',
          '&:hover': { border: `1px solid ${concrete.void}`, borderRadius: 0 },
        },
      },
    },
  },
});

export default theme;
