# GSS PDI Data Form
A simple form for PDI operators to enter PDI details and loading photos.

The PDI details contains 
1. Project Reference number(string)
2. Customer name(string)
3. Container number(int)
4. Container ID(string)
5. Container size([ '40 feet','20 feet','Air' ])
6. Date(Date)
7. Shift([ 'A','B','C' ])
8. PDI inspectors([ name(string) ])
9. Issues([ [ issue(string),qty(int),status(sting) ] ])
10. Status(['WIP','Completed'])

PDI photos to be stored as inside a folder named f"{Project Reference number} Cnt{Container number}" inside a one drive specified location.

PDI inspectors and Issues to be provided with addable and removable fields

All the details are to be posted in an one drive specified excel file

# Menu 
A simple menu where users can select to either enter data or fill or make PDI reports

# GSS PDI report