import { createTheme } from '@mui/material/styles';
import { brand, concrete, designTokens, moss, ochre, oxide } from './palette';

const theme = createTheme({
  palette: {
    primary: { main: brand.main, dark: brand.dark, contrastText: '#FFFFFF' },
    secondary: { main: concrete.aggregate },
    success: moss, error: oxide, warning: ochre,
    background: { default: concrete.bg, paper: concrete.paper },
    text: { primary: concrete.void, secondary: concrete.aggregate },
    divider: concrete.stone,
  },
  shape: { borderRadius: designTokens.radii.control },
  typography: {
    fontFamily: designTokens.fontFamily,
    h4: { fontWeight: 600, fontSize: '1.9rem', letterSpacing: -1, lineHeight: 1.25 },
    h5: { fontWeight: 600, letterSpacing: -.6 },
    h6: { fontWeight: 600, fontSize: '1.05rem', letterSpacing: -.25 },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: 14, lineHeight: 1.65 },
    body2: { fontSize: 13, lineHeight: 1.65 },
    caption: { fontSize: 12 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0, fontSize: 13 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: {
      body: { backgroundColor: concrete.bg },
      ':focus-visible': { outline: '3px solid #86AB92', outlineOffset: 3 },
    } },
    MuiCard: { styleOverrides: { root: { border: `1px solid ${concrete.stone}`, borderRadius: designTokens.radii.card, boxShadow: '0 3px 14px #203C3405', backgroundImage: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 40, padding: '9px 17px', borderRadius: designTokens.radii.control, transition: 'background-color .15s, box-shadow .15s', '&:focus-visible': { outline: '3px solid #86AB92', outlineOffset: 3 } },
        contained: { '&:hover': { boxShadow: '0 4px 12px #244F3F20' } },
        outlined: { borderColor: concrete.stone, '&:hover': { borderColor: brand.main, backgroundColor: '#EDF4E7' } },
        sizeSmall: { minHeight: 32, padding: '5px 11px', fontSize: 12 },
      },
    },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: {
      root: { backgroundColor: concrete.paper, fontSize: 14, minHeight: 44,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: concrete.stone },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#B7C4B2' },
        '&.Mui-focused': { boxShadow: '0 0 0 3px #648B6714' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brand.main, borderWidth: 1 },
      },
    } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 14, color: concrete.aggregate } } },
    MuiFormHelperText: { styleOverrides: { root: { fontSize: 11, marginLeft: 0 } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 14, minHeight: 40, borderRadius: 6, margin: '2px 6px' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontSize: 11, fontWeight: 600, height: 27, border: 0, backgroundColor: concrete.bg }, label: { paddingInline: 10 } } },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: designTokens.radii.card } } },
    MuiTableHead: { styleOverrides: { root: { '& .MuiTableCell-root': { color: concrete.aggregate, backgroundColor: '#F5F7F1', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' } } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: concrete.stone, fontSize: 13, padding: '15px 20px', fontVariantNumeric: 'tabular-nums' } } },
    MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: '#F8FAF5' }, '&:last-child td': { borderBottom: 0 } } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 12, height: 7, backgroundColor: '#E9EEDF' }, bar: { borderRadius: 12 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: designTokens.radii.dialog, boxShadow: '0 24px 80px #142D2530', border: `1px solid ${concrete.stone}`, margin: 16, width: 'calc(100% - 32px)' } } },
    MuiDialogTitle: { styleOverrides: { root: { padding: '24px 24px 20px', color: concrete.void, fontSize: 21, fontWeight: 600, letterSpacing: -.5 } } },
    MuiDialogContent: { styleOverrides: { root: { paddingInline: 24 } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '20px 24px 24px', gap: 8, borderTop: `1px solid ${concrete.stone}`, marginTop: 16 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 8, fontSize: 13, border: '1px solid transparent', alignItems: 'center' }, standardError: { backgroundColor: oxide.light, color: oxide.main, borderColor: '#F0D3C8' }, standardSuccess: { backgroundColor: moss.light, color: moss.main }, standardWarning: { backgroundColor: ochre.light, color: ochre.main } } },
    MuiDivider: { styleOverrides: { root: { borderColor: concrete.stone } } },
    MuiSkeleton: { styleOverrides: { root: { borderRadius: 10, backgroundColor: '#E8EDE2' } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 6, backgroundColor: concrete.charcoal, fontSize: 12, padding: '7px 10px' } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8, color: concrete.aggregate, '&:hover': { backgroundColor: moss.light, color: brand.main } } } },
    MuiToggleButtonGroup: { styleOverrides: { root: { flexWrap: 'wrap', gap: 4 } } },
    MuiToggleButton: { styleOverrides: { root: { borderRadius: '7px !important', border: `1px solid ${concrete.stone} !important`, textTransform: 'none', fontSize: 12, padding: '7px 14px', '&.Mui-selected': { backgroundColor: moss.light, color: brand.main, borderColor: `${brand.main} !important` } } } },
    MuiSwitch: { defaultProps: { color: 'primary' } },
  },
});

export default theme;
