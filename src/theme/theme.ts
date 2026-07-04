import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD600',
      contrastText: '#000000',
    },
    success: {
      main: '#007A45',
      light: '#D6F0E0',
    },
    error: {
      main: '#CC0000',
      light: '#FFE0E0',
    },
    background: {
      default: '#F5F0E8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#444444',
    },
    divider: '#000000',
  },
  typography: {
    fontFamily: '"Space Mono", "Courier New", monospace',
    h4: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 },
    h5: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 },
    h6: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
    subtitle1: { fontWeight: 700 },
    body2: { color: '#444444' },
    caption: { color: '#666666' },
    button: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1.5 },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '4px 4px 0px #000000',
          border: '2px solid #000000',
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
            boxShadow: '3px 3px 0px #000000',
            transform: 'translate(-1px, -1px)',
          },
          '&:active': {
            boxShadow: 'none',
            transform: 'translate(2px, 2px)',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          border: '2px solid #000000',
          '&:hover': { backgroundColor: '#111111' },
          '&.Mui-disabled': { backgroundColor: '#BBBBBB', color: '#777777', border: '2px solid #BBBBBB' },
        },
        outlined: {
          border: '2px solid #000000',
          color: '#000000',
          '&:hover': { border: '2px solid #000000', backgroundColor: 'rgba(0,0,0,0.06)' },
        },
        text: {
          color: '#000000',
          fontWeight: 700,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.06)', boxShadow: 'none', transform: 'none' },
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
          '& fieldset': { borderColor: '#000000', borderWidth: '2px' },
          '&:hover fieldset': { borderColor: '#000000 !important', borderWidth: '2px !important' },
          '&.Mui-focused fieldset': { borderColor: '#000000 !important', borderWidth: '2px !important' },
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
          color: '#000000',
          '&.Mui-focused': { color: '#000000' },
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
          border: '1.5px solid #000000',
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
            color: '#FFFFFF',
            backgroundColor: '#000000',
            borderBottom: '2px solid #000000',
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
          borderColor: '#DDDDDD',
          fontSize: 13,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.03) !important' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          height: 10,
          backgroundColor: '#E5E0D8',
          border: '1px solid #000000',
        },
        bar: {
          borderRadius: 0,
          backgroundColor: '#000000',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: '3px solid #000000',
          boxShadow: '8px 8px 0px #000000',
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
          borderBottom: '2px solid #000000',
          backgroundColor: '#000000',
          color: '#FFFFFF',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: '2px solid #000000',
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
          borderColor: '#CC0000',
          backgroundColor: '#FFE0E0',
          color: '#CC0000',
        },
        standardSuccess: {
          borderColor: '#007A45',
          backgroundColor: '#D6F0E0',
          color: '#007A45',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#000000', borderWidth: 1 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 0, backgroundColor: 'rgba(0,0,0,0.08)' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: '#000000',
          fontFamily: '"Space Mono", "Courier New", monospace',
          fontSize: 11,
          border: '1px solid #000000',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid transparent',
          '&:hover': { border: '1px solid #000000', borderRadius: 0 },
        },
      },
    },
  },
});

export default theme;
