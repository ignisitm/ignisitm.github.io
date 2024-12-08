import {
	DataTableCell,
	Table,
	TableBody,
	TableCell,
	TableHeader,
} from "@david.kucsai/react-pdf-table";
import {
	PDFViewer,
	Document,
	Page,
	View,
	Text,
	StyleSheet,
} from "@react-pdf/renderer";

const KPI = () => {
	const data = [
		{
			sr: 1,
			lastName: "desc1",
			firstName: 5,
			days: 5,
			startDate: "fe",
			endDate: "df",
			info: "fegdf",
		},
		{
			sr: 1,
			lastName: "desc1",
			firstName: 5,
			days: 5,
			startDate: "fe",
			endDate: "df",
			info: "fegdf",
		},
		{
			sr: 1,
			lastName: "desc1",
			firstName: 5,
			days: 5,
			startDate: "fe",
			endDate: "df",
			info: "fegdf",
		},
	];

	const maximumDays = 10;

	const styles = StyleSheet.create({
		table: {
			width: "100%",
			padding: 15,
			fontSize: "12px",
		},

		row: {
			display: "flex",
			flexDirection: "row",
			borderTop: "1px solid #EEE",
			paddingTop: 8,
			paddingBottom: 8,
		},

		header: {
			borderTop: "none",
		},

		bold: {
			fontWeight: "bold",
		},

		cell: {
			borderLeft: "1px solid #EEE",
		},

		// So Declarative and unDRY 👌
		col1: {
			borderLeft: "none",
			width: "27%",
		},

		col2: {
			width: "15%",
		},

		col3: {
			width: "15%",
		},

		col4: {
			width: "20%",
		},

		col5: {
			width: "27%",
		},
	});

	// Create Document Component
	const MyDocument = () => (
		<Document>
			<Page style={{}} size="A4" wrap>
				<View style={styles.table}>
					<View style={[styles.row, styles.bold, styles.header]}>
						<Text style={[styles.cell, styles.col1]}>Name</Text>
						<Text style={[styles.cell, styles.col2]}>Start Date</Text>
						<Text style={[styles.cell, styles.col3]}>End Date</Text>
						<Text style={[styles.cell, styles.col4]}>Days</Text>
						<Text style={[styles.cell, styles.col5]}>Info</Text>
					</View>
					{data.map((row, i): any => (
						<View key={i} style={styles.row} wrap={false}>
							<Text style={styles.col1}>
								<Text style={styles.bold}>{row.lastName}</Text>, {row.firstName}
							</Text>
							<Text style={styles.col2}>{row.startDate}</Text>
							<Text style={styles.col3}>{row.endDate}</Text>
							<Text style={styles.col4}>
								<Text style={styles.bold}>{row.days}</Text> of {maximumDays}
							</Text>
							<Text style={styles.col5}>{row.info}</Text>
						</View>
					))}
				</View>
			</Page>
		</Document>
	);

	return (
		<PDFViewer>
			<MyDocument />
		</PDFViewer>
	);
};

export default KPI;
